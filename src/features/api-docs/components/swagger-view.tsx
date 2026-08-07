"use client";

import * as React from "react";
import { Download, FileCode2, Server, ShieldCheck } from "lucide-react";

import type { ApiEndpoint, ApiService } from "@/lib/types";
import { matchesQuery } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { StatusBadge } from "@/components/common/status-badge";
import { NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { useHighlight } from "@/hooks/use-highlight";
import { useDownload } from "@/hooks/use-download";
import { EndpointPanel } from "@/features/api-docs/components/endpoint-panel";

const INITIAL_FILTERS = { method: "all", tag: "all" };

export function SwaggerView() {
  const { highlight, marker } = useHighlight();
  const download = useDownload();
  const { apiServices } = useProjectData();

  const apiEndpoints = React.useMemo(
    () => apiServices.flatMap((service) => service.endpoints),
    [apiServices],
  );

  const predicate = React.useCallback(
    (item: ApiEndpoint, query: string, filters: typeof INITIAL_FILTERS) => {
      if (filters.method !== "all" && item.method !== filters.method) return false;
      if (filters.tag !== "all" && item.tag !== filters.tag) return false;
      return matchesQuery(
        query,
        item.id,
        item.path,
        item.summary,
        item.description,
        item.operationId,
      );
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: apiEndpoints,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  const exportSpec = React.useCallback(() => {
    download(
      JSON.stringify(buildOpenApiDocument(apiServices), null, 2),
      "openapi.json",
      "application/json",
    );
  }, [download, apiServices]);

  const visibleIds = React.useMemo(() => new Set(results.map((item) => item.id)), [results]);

  return (
    <div className="space-y-6">
      {marker}
      <PageHeader
        title="Swagger API"
        description="REST contract documentation for the services supporting the payment journey. Each operation lists its headers, request body, responses and the requirements it satisfies."
        meta={[
          { label: "Services", value: apiServices.length },
          { label: "Endpoints", value: apiEndpoints.length },
          { label: "Specification", value: "OpenAPI 3.0.3" },
          { label: "Environment", value: "UAT" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportSpec}>
              <Download /> Export OpenAPI
            </Button>
            <SecureLinkDialog resourceName="Instant Payments API v2.3.0" resourcePath="/swagger-api" />
          </>
        }
      />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search endpoints by path, summary or operation ID…"
        filters={[
          {
            key: "method",
            label: "Method",
            value: filters.method,
            options: ["GET", "POST", "PUT", "PATCH", "DELETE"],
          },
          {
            key: "tag",
            label: "Tag",
            value: filters.tag,
            options: Array.from(new Set(apiEndpoints.map((endpoint) => endpoint.tag))).sort(),
          },
        ]}
        onFilterChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={apiEndpoints.length}
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <div className="space-y-6">
          {apiServices.map((service) => {
            const endpoints = service.endpoints.filter((endpoint) => visibleIds.has(endpoint.id));
            if (endpoints.length === 0) return null;

            return (
              <Card key={service.id} className="overflow-hidden">
                <div className="space-y-3 border-b border-border bg-surface-muted p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileCode2 className="size-4 text-primary" />
                    <h2 className="text-[15px] font-semibold tracking-tight">{service.name}</h2>
                    <Badge variant="outline" className="font-mono">
                      v{service.version}
                    </Badge>
                    <StatusBadge status={service.status} />
                  </div>
                  <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Server className="size-3.5" />
                      <span className="font-mono">{service.basePath}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5" />
                      OAuth 2.0 client credentials + PSU consent
                    </span>
                    <span>Owner · {service.owner}</span>
                  </div>
                </div>

                <div className="space-y-2.5 p-5">
                  {endpoints.map((endpoint) => (
                    <EndpointPanel
                      key={endpoint.id}
                      endpoint={endpoint}
                      basePath={service.basePath}
                      highlighted={highlight === endpoint.id}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-4 text-[13px] leading-relaxed text-muted-foreground">
        All operations require mutual TLS on the internal service mesh in addition to the bearer
        token. Error responses follow RFC 7807 problem details and always carry the workspace error
        code (for example <span className="font-mono text-xs text-foreground">IPH-LIM-002</span>) so
        the functional specification and the API remain in step.
      </Card>
    </div>
  );
}

/** Builds a valid OpenAPI 3.0.3 document from the endpoint catalogue. */
function buildOpenApiDocument(apiServices: ApiService[]) {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const service of apiServices) {
    for (const endpoint of service.endpoints) {
      const key = `${new URL(service.basePath).pathname}${endpoint.path}`;
      paths[key] = paths[key] ?? {};
      paths[key][endpoint.method.toLowerCase()] = {
        tags: [endpoint.tag],
        summary: endpoint.summary,
        description: endpoint.description,
        operationId: endpoint.operationId,
        parameters: endpoint.parameters.map((parameter) => ({
          name: parameter.name,
          in: parameter.in,
          required: parameter.required,
          description: parameter.description,
          schema: { type: "string", example: parameter.example },
        })),
        ...(endpoint.requestBody
          ? {
              requestBody: {
                required: true,
                content: {
                  "application/json": { example: JSON.parse(endpoint.requestBody) },
                },
              },
            }
          : {}),
        responses: Object.fromEntries(
          endpoint.responses.map((response) => [
            String(response.status),
            {
              description: response.description,
              ...(response.body
                ? { content: { "application/json": { example: JSON.parse(response.body) } } }
                : {}),
            },
          ]),
        ),
        "x-requirements": endpoint.relatedRequirements,
      };
    }
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "Instant Payments API",
      version: "2.3.0",
      description:
        "Synchronous SEPA Instant Credit Transfer initiation, status enquiry, recall and supporting services.",
      contact: { name: "Payments Change Delivery", email: "payments-change@retail-bank.example" },
    },
    servers: apiServices.map((service) => ({ url: service.basePath, description: service.name })),
    paths,
    components: {
      securitySchemes: {
        oauth2: {
          type: "oauth2",
          flows: {
            clientCredentials: {
              tokenUrl: "https://api.retail-bank.example/oauth2/token",
              scopes: {
                "payments:initiate": "Initiate instant payments",
                "payments:read": "Read payment status",
                "payments:recall": "Raise recall requests",
                "beneficiaries:verify": "Verify beneficiary names",
                "customers:limits:read": "Read customer limits",
              },
            },
          },
        },
      },
    },
  };
}

"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Terminal } from "../terminal";
import { CheckCircle2, XCircle, Info, Terminal as TerminalIcon, Key } from "lucide-react";
import { CopyActionCell } from "./copy-action-cell";

import { SubmissionPayload, StaticValidations, DynamicValidations } from "@/lib/types";
import { DynamicValidationStatus, StaticValidationStatus } from "@/lib/verification-status";

interface SubmissionPayloadViewerProps {
  payload: SubmissionPayload;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

type DynamicValidationRow = ReturnType<typeof flattenDynamicValidations>[number];
type StaticValidationRow = ReturnType<typeof flattenStaticValidations>[number];

function getBaseColumns<T extends { objectRef: string; status: string; message: string }>() {
  return [
    {
      header: "Object",
      accessorKey: "objectRef",
      cell: ({ row }: { row: { original: T } }) => <span className='text-sm'>{row.original.objectRef}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row: { original: T } }) => (
        <span className='flex justify-center items-center'>{row.original.status === "Pass" ? <CheckCircle2 className='h-4 w-4 text-green-600' /> : <XCircle className='h-4 w-4 text-red-600' />}</span>
      ),
    },
    {
      header: "Message",
      accessorKey: "message",
      cell: ({ row }: { row: { original: T } }) => <span className='text-sm'>{row.original.message}</span>,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }: { row: { original: T } }) => <CopyActionCell message={row.original.message} objectRef={row.original.objectRef} />,
    },
  ];
}

function getDynamicColumns(): ColumnDef<DynamicValidationRow>[] {
  return [
    {
      header: "Kind",
      accessorKey: "resultKind",
      cell: ({ row }) => {
        const kind = row.original.resultKind;
        let icon = null;
        if (kind === "status") icon = <Info className='inline h-4 w-4 mr-1 text-blue-500 align-middle' />;
        else if (kind === "logs") icon = <TerminalIcon className='inline h-4 w-4 mr-1 text-yellow-500 align-middle' />;
        else if (kind === "rbac") icon = <Key className='inline h-4 w-4 mr-1 text-purple-500 align-middle' />;
        return (
          <span className='flex items-center text-sm'>
            {icon}
            <span>{kind}</span>
          </span>
        );
      },
    },
    ...getBaseColumns<DynamicValidationRow>(),
  ];
}

function getStaticColumns(): ColumnDef<StaticValidationRow>[] {
  return [{ header: "Rule", accessorKey: "rule" }, ...getBaseColumns<StaticValidationRow>()];
}

function flattenDynamicValidations(arr: DynamicValidationStatus[]): Array<{
  objectRef: string;
  resultKind: string;
  status: string;
  message: string;
}> {
  return arr.flatMap((status) =>
    Array.isArray(status.resources)
      ? status.resources.flatMap((resource) =>
          Array.isArray(resource.checkResults)
            ? resource.checkResults.map((result) => ({
                objectRef: `${resource.target.kind.toLowerCase()}/${resource.target.name}`,
                resultKind: result.kind,
                status: result.status,
                message: result.message ?? "",
              }))
            : []
        )
      : []
  );
}

function flattenStaticValidations(arr: StaticValidationStatus[]): Array<{
  objectRef: string;
  rule: string;
  status: string;
  message: string;
}> {
  return arr.flatMap((status) =>
    Array.isArray(status.resources)
      ? status.resources.flatMap((resource) =>
          Array.isArray(resource.ruleResults)
            ? resource.ruleResults.map((result) => ({
                objectRef: `${resource.target.kind.toLowerCase()}/${resource.target.name}`,
                rule: result.rule,
                status: result.status,
                message: result.message ?? "",
              }))
            : []
        )
      : []
  );
}

export function SubmissionPayloadViewer({ payload, activeTab, onTabChange }: SubmissionPayloadViewerProps) {
  const dynamicValidations: DynamicValidations = payload?.dynamicValidations || {};
  const staticValidations: StaticValidations = payload?.staticValidations || {};

  return (
    <Tabs value={activeTab} defaultValue='static' onValueChange={onTabChange} className='w-full mt-2'>
      <TabsList className='mb-2'>
        <TabsTrigger value='static'>Static Validations</TabsTrigger>
        <TabsTrigger value='dynamic'>Dynamic Validations</TabsTrigger>
        <TabsTrigger value='json'>JSON Payload</TabsTrigger>
      </TabsList>
      <TabsContent value='json' className='fade-tab-in'>
        <Terminal content={JSON.stringify(payload, null, 2)} thingToCopy='JSON Payload' />
      </TabsContent>
      <TabsContent value='dynamic' className='fade-tab-in'>
        {Object.keys(dynamicValidations).length === 0 ? (
          <div className='text-muted-foreground text-sm'>No dynamic validations.</div>
        ) : (
          Object.entries(dynamicValidations).map(([key, status]) => (
            <div key={key} className='mb-6'>
              <h4 className='font-semibold mb-2 text-sm'>{key}</h4>
              <DataTable columns={getDynamicColumns()} data={flattenDynamicValidations(Array.isArray(status) ? status : [status])} />
            </div>
          ))
        )}
      </TabsContent>
      <TabsContent value='static' className='fade-tab-in'>
        {Object.keys(staticValidations).length === 0 ? (
          <div className='text-muted-foreground text-sm'>No static validations.</div>
        ) : (
          Object.entries(staticValidations).map(([key, status]) => (
            <div key={key} className='mb-6'>
              <h4 className='font-semibold mb-2 text-sm'>{key}</h4>
              <DataTable columns={getStaticColumns()} data={flattenStaticValidations(Array.isArray(status) ? status : [status])} />
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}

import React, { useMemo } from 'react'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import Code from '../Text/Code'
import type {
  AjvArraySchema,
  AjvEnumSchema,
  AjvNamedSchema,
  AjvNumberSchema,
  AjvObjectSchema,
  AjvOperatorSchema,
  AjvSchema,
  AjvStringSchema,
} from '../../entities/Schema/types'
import { toArray } from './utils'

export type RequestTableProps = {
  query?: AjvObjectSchema
  params?: AjvObjectSchema
  header?: AjvObjectSchema
  body?: AjvObjectSchema
}

export default React.memo(function RequestTable({
  params,
  query,
  body,
  header,
}: RequestTableProps) {
  return (
    <Table basic="very" className="RequestTable">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Type</Table.HeaderCell>
          <Table.HeaderCell>Place</Table.HeaderCell>
          <Table.HeaderCell>Description</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {params &&
          params.properties &&
          Object.keys(params.properties).map((key) => {
            return (
              <RequestTableRow
                key={`param::${key}`}
                name={key}
                position="url"
                definition={params!.properties![key]}
                required={params?.required}
              />
            )
          })}
        {query &&
          query.properties &&
          Object.keys(query.properties).map((key) => {
            return (
              <RequestTableRow
                key={`query::${key}`}
                name={key}
                position="qs"
                definition={query!.properties![key]}
                required={query?.required}
              />
            )
          })}
        {header &&
          header.properties &&
          Object.keys(header.properties).map((key) => {
            return (
              <RequestTableRow
                key={`header::${key}`}
                name={key}
                position="header"
                definition={header!.properties![key]}
                required={header?.required}
              />
            )
          })}
        {body &&
          body.properties &&
          Object.keys(body.properties).map((key) => {
            return (
              <RequestTableRow
                key={`body::${key}`}
                name={key}
                position="body"
                definition={body!.properties![key]}
                required={body?.required}
              />
            )
          })}
      </Table.Body>
    </Table>
  )
})

const RequestTableRow = React.memo(
  ({
    name,
    position,
    definition,
    required,
  }: {
    name?: string
    position: string
    definition: AjvSchema
    required?: string[]
  }) => {
    const isRequired = !!name && (required || []).includes(name)
    const items = useMemo(() => toArray((definition as AjvArraySchema).items), [
      definition,
    ])
    const oneOf = useMemo(() => (definition as AjvOperatorSchema).oneOf, [
      definition,
    ])
    const anyOf = useMemo(() => (definition as AjvOperatorSchema).anyOf, [
      definition,
    ])

    const obj = useMemo(() => {
      return (definition as AjvObjectSchema).type === 'object'
        ? (definition as AjvObjectSchema)
        : null
    }, [definition])

    return (
      <>
        <Table.Row>
          <RequestTableNameCell required={isRequired} name={name} />
          <RequestTableTypeCell definition={definition} />
          <Table.Cell>
            <Code inline>{position}</Code>
          </Table.Cell>
          <RequestTableDescriptionCell
            required={isRequired}
            definition={definition}
          />
        </Table.Row>
        {oneOf &&
          oneOf.map((item, i) => (
            <RequestTableRow key={i} position={position} definition={item} />
          ))}
        {anyOf &&
          anyOf.map((item, i) => (
            <RequestTableRow key={i} position={position} definition={item} />
          ))}
        {items.map((item, i) => (
          <RequestTableRow
            key={i}
            name={`${name}[]`}
            position={position}
            definition={item}
          />
        ))}
        {obj?.properties &&
          Object.keys(obj.properties).map((key) => (
            <RequestTableRow
              key={key}
              name={`${name}.${key}`}
              position={position}
              definition={obj.properties![key]}
              required={obj.required}
            />
          ))}
      </>
    )
  }
)

const RequestTableNameCell = React.memo(function ({
  required,
  name,
}: {
  required: boolean
  name?: string
}) {
  return (
    <Table.Cell style={name ? {} : { borderTop: 0 }}>
      {name && (
        <span style={{ fontWeight: required ? 'bold' : 'normal' }}>
          <Code inline>{name}</Code>
        </span>
      )}
    </Table.Cell>
  )
})

const RequestTableTypeCell = React.memo(function ({
  definition,
}: {
  definition: AjvSchema
}) {
  let types: string[] = []

  if ((definition as AjvEnumSchema).enum) {
    types.push(
      (definition as AjvEnumSchema).enum
        .map((value) => JSON.stringify(value))
        .join(' | ')
    )
  }

  if ((definition as AjvNamedSchema).type) {
    types.push(toArray((definition as AjvNamedSchema).type).join(' | '))
  }

  if ((definition as AjvNamedSchema).nullable) {
    types.push('null')
  }

  return (
    <Table.Cell>
      {types.length > 0 && <Code inline> {types.join(' | ')} </Code>}
    </Table.Cell>
  )
})

const RequestTableDescriptionCell = React.memo(function ({
  required,
  definition,
}: {
  required: boolean
  definition: AjvSchema
}) {
  return (
    <Table.Cell>
      {(definition as AjvNamedSchema).description || ''}
      {required ? ' [required]' : ''}
      {(definition as AjvNamedSchema).default !== undefined &&
        ` [default: ${JSON.stringify((definition as AjvNamedSchema).default)}]`}
      {(definition as AjvNumberSchema).minimum !== undefined &&
        ` [minimum: ${JSON.stringify(
          (definition as AjvNumberSchema).minimum
        )}]`}
      {(definition as AjvNumberSchema).maximum !== undefined &&
        ` [maximum: ${JSON.stringify(
          (definition as AjvNumberSchema).maximum
        )}]`}
      {(definition as AjvNumberSchema).exclusiveMinimum !== undefined &&
        ` [exclusiveMinimum: ${JSON.stringify(
          (definition as AjvNumberSchema).exclusiveMinimum
        )}]`}
      {(definition as AjvNumberSchema).exclusiveMaximum !== undefined &&
        ` [exclusiveMaximum: ${JSON.stringify(
          (definition as AjvNumberSchema).exclusiveMaximum
        )}]`}
      {(definition as AjvNumberSchema).multipleOf !== undefined &&
        ` [multipleOf: ${JSON.stringify(
          (definition as AjvNumberSchema).multipleOf
        )}]`}
      {(definition as AjvStringSchema).format !== undefined &&
        ` [format: ${JSON.stringify((definition as AjvStringSchema).format)}]`}
      {(definition as AjvStringSchema).minLength !== undefined &&
        ` [minLength: ${JSON.stringify(
          (definition as AjvStringSchema).minLength
        )}]`}
      {(definition as AjvStringSchema).maxLength !== undefined &&
        ` [maxLength: ${JSON.stringify(
          (definition as AjvStringSchema).maxLength
        )}]`}
      {(definition as AjvStringSchema).pattern !== undefined &&
        ` [pattern: ${JSON.stringify(
          (definition as AjvStringSchema).pattern
        )}]`}
      {(definition as AjvArraySchema).uniqueItems !== undefined &&
        ` [uniqueItems: ${JSON.stringify(
          (definition as AjvArraySchema).uniqueItems
        )}]`}
      {(definition as AjvArraySchema).additionalItems !== undefined &&
        ` [additionalItems: ${JSON.stringify(
          (definition as AjvArraySchema).additionalItems
        )}]`}
      {(definition as AjvArraySchema).unevaluatedItems !== undefined &&
        ` [unevaluatedItems: ${JSON.stringify(
          (definition as AjvArraySchema).unevaluatedItems
        )}]`}
      {(definition as AjvArraySchema).minItems !== undefined &&
        ` [minItems: ${JSON.stringify(
          (definition as AjvArraySchema).minItems
        )}]`}
      {(definition as AjvArraySchema).maxItems !== undefined &&
        ` [maxItems: ${JSON.stringify(
          (definition as AjvArraySchema).maxItems
        )}]`}
      {(definition as AjvArraySchema).minContains !== undefined &&
        ` [minContains: ${JSON.stringify(
          (definition as AjvArraySchema).maxContains
        )}]`}
      {(definition as AjvArraySchema).maxContains !== undefined &&
        ` [maxContains: ${JSON.stringify(
          (definition as AjvArraySchema).maxContains
        )}]`}
      {(definition as AjvObjectSchema).additionalProperties !== undefined &&
        ` [additionalProperties: ${JSON.stringify(
          (definition as AjvObjectSchema).additionalProperties
        )}]`}
    </Table.Cell>
  )
})

import { Type } from '@sinclair/typebox'

export enum Health {
    GREEN = 'green',
    YELLOW = 'yellow',
    RED = 'red'
}

export const Issue = Type.Object({
    id: Type.Number(),
    username: Type.String(),
    health: Type.Enum(Health),
    start: Type.String(),
    end: Type.Optional(Type.String()),
    title: Type.String(),
    body: Type.String(),
})

export const ServiceDate = Type.Object({
    date: Type.Date(),
    health: Type.Enum(Health),
    issues: Type.Array(Type.Integer())
})

export const Service = Type.Object({
    id: Type.String(),
    name: Type.String(),
    health: Type.Optional(Type.Enum(Health)),
    dates: Type.Optional(Type.Array(ServiceDate))
});

export const Config = Type.Object({
    repo: Type.String(),
    services: Type.Array(Service)
})

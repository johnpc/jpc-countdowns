import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Countdown: a
    .model({
      emoji: a.string().required(),
      title: a.string().required(),
      date: a.datetime().required(),
      hexColor: a.string().required(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

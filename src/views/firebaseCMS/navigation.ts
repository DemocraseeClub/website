import { EntityCollection } from "@camberi/firecms";
import userCollection from "./collections/user";
import resourceCollection from "./collections/resource";
import resourceTypesCollection from "./collections/resource_types";
import officialCollection from "./collections/official";
import partyCollection from "./collections/party";
import cityCollection from "./collections/city";
import stateCollection from "./collections/state";
import rallyCollection from "./collections/rally";
import topicCollection from "./collections/topic";
import meetingCollection from "./collections/meeting";
import meetingTypesCollection from "./collections/meeting_types";
import stakeholderCollection from "./collections/stakeholder";
import actionPlanCollection from "./collections/action_plan";
import pageCollection from "./collections/page";
import inviteCollection from "./collections/invite";
import WiseDemo from './collections/wise_demo';

export const navigationAdmin: EntityCollection[] = [
  userCollection,
  resourceCollection,
  resourceTypesCollection,
  officialCollection,
  partyCollection,
  cityCollection,
  stateCollection,
  rallyCollection,
  topicCollection,
  meetingCollection,
  meetingTypesCollection,
  stakeholderCollection,
  actionPlanCollection,
  pageCollection,
  inviteCollection,
  WiseDemo
];

export const navigationUser: EntityCollection[] = [
  resourceCollection,
  cityCollection,
  rallyCollection,
  meetingCollection,
  meetingTypesCollection,
  stakeholderCollection,
  actionPlanCollection,
  WiseDemo
];

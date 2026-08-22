/**
 * The object catalogue.
 *
 * This used to be a seeded generator that invented ~400 plausible objects. It
 * is now a thin re-export of the real CelesTrak snapshot ingest, so that every
 * screen importing from here gets real tracked objects with real element sets
 * without needing to know where they came from.
 *
 * See engine/parse.ts for exactly which fields are read off the TLE and which
 * two are documented assumptions.
 */
export {
  CATALOGUE,
  CATALOGUE_TOTAL,
  GROUP_COUNTS,
  GROUP_EVENT,
  OBJECT_COUNTS,
  OBJECTS,
  PROVENANCE,
  SNAPSHOT_EPOCH,
  entryById,
  groupOf,
  isIndianAsset,
  objectById,
} from './engine/catalogue';

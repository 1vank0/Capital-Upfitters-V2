/**
 * Payload CMS access logging hook.
 *
 * Logs every create / update / delete operation to stdout (structured JSON).
 * On Vercel this feeds into Vercel Logs; on VPS pipe to a log file.
 *
 * Attach via collection `hooks.afterChange` and `hooks.afterDelete`.
 */

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'

export const logAfterChange: CollectionAfterChangeHook = ({
  collection,
  doc,
  operation,
  req,
}) => {
  const entry = {
    level: 'info',
    event: 'cms_change',
    collection: collection.slug,
    operation,
    docId: doc?.id,
    user: req.user?.email ?? 'anonymous',
    timestamp: new Date().toISOString(),
  }
  console.log(JSON.stringify(entry))
  return doc
}

export const logAfterDelete: CollectionAfterDeleteHook = ({
  collection,
  doc,
  req,
}) => {
  const entry = {
    level: 'info',
    event: 'cms_delete',
    collection: collection.slug,
    docId: doc?.id,
    user: req.user?.email ?? 'anonymous',
    timestamp: new Date().toISOString(),
  }
  console.log(JSON.stringify(entry))
  return doc
}

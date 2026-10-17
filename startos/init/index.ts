import { actions } from '../actions'
import { restoreInit } from '../backups'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { sdk } from '../sdk'
import { versionGraph } from '../versions'
import { seedFiles } from './seedFiles'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  dependencies,
  actions,
)

export const uninit = sdk.setupUninit(versionGraph)

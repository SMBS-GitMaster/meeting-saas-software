import { makeAutoObservable } from 'mobx'

import { Id } from '@mm/gql'

import { createDIHook } from '@mm/core/di/resolver'

class WorkspaceFullScreenTileController {
  constructor() {
    makeAutoObservable(this)
  }

  public activeFullScreenTileId: Maybe<Id> = null

  private workspaceTileIds: Array<Id> = []

  public setWorkspaceTileIds = (workspaceTileIds: Array<Id>) => {
    this.workspaceTileIds = workspaceTileIds
  }

  public clearWorkspaceTileIds = () => {
    this.workspaceTileIds = []
  }

  public fullScreenTile = (tileId: Id) => {
    this.activeFullScreenTileId = tileId
  }

  public minimizeTile = () => {
    this.activeFullScreenTileId = null
  }

  public nextTile = () => {
    if (this.workspaceTileIds.length) {
      if (!this.activeFullScreenTileId) {
        this.activeFullScreenTileId = this.workspaceTileIds[0]
      } else {
        const lastTileId =
          this.workspaceTileIds[this.workspaceTileIds.length - 1]

        if (this.activeFullScreenTileId === lastTileId) {
          this.activeFullScreenTileId = this.workspaceTileIds[0]
        } else {
          const currentTileIdIndex = this.workspaceTileIds.findIndex(
            (tileId) => tileId === this.activeFullScreenTileId
          )

          this.activeFullScreenTileId =
            this.workspaceTileIds[currentTileIdIndex + 1]
        }
      }
    }
  }

  public previousTile = () => {
    if (this.workspaceTileIds.length) {
      if (!this.activeFullScreenTileId) {
        this.activeFullScreenTileId = this.workspaceTileIds[0]
      } else {
        const firstTileId = this.workspaceTileIds[0]

        if (this.activeFullScreenTileId === firstTileId) {
          this.activeFullScreenTileId =
            this.workspaceTileIds[this.workspaceTileIds.length - 1]
        } else {
          const currentTileIdIndex = this.workspaceTileIds.findIndex(
            (tileId) => tileId === this.activeFullScreenTileId
          )

          this.activeFullScreenTileId =
            this.workspaceTileIds[currentTileIdIndex - 1]
        }
      }
    }
  }
}

export const DI_NAME =
  '@mm/bloom-web/pages/workspace/workspaceFullScreenTile/workspaceFullScreenTileController'

export const getWorkspaceFullScreenTileController = (diResolver: IDIResolver) =>
  diResolver.getOrCreate(DI_NAME, () => new WorkspaceFullScreenTileController())

export const useWorkspaceFullScreenTileController = createDIHook(
  DI_NAME,
  getWorkspaceFullScreenTileController
)

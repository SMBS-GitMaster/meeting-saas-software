import { observer } from 'mobx-react'
import React from 'react'

import {
  Clickable,
  Drawer,
  Expandable,
  useDrawerController,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

const EXAMPLE_CREATE_DRAWER_ID = 'EXAMPLE_CREATE_DRAWER_ID'
const EXAMPLE_EDIT_DRAWER_ID = 'EXAMPLE_EDIT_DRAWER_ID'

export const DrawerDemo = observer(function DrawerDemo() {
  const { openDrawer: openDrawerController } = useDrawerController()
  const { openOverlazy } = useOverlazyController()

  return (
    <Expandable title='Drawers'>
      <>
        {/* BASE DRAWERS */}
        <div>
          <Clickable
            clicked={() => openDrawerController('EXAMPLE_CREATE_DRAWER_ID')}
          >
            <span>Open Create Drawer</span>
          </Clickable>
          <CreateDrawer />
        </div>
        <div>
          <Clickable
            clicked={() => openDrawerController('EXAMPLE_EDIT_DRAWER_ID')}
          >
            <span>Open Edit Drawer</span>
          </Clickable>
          <EditDrawer />
        </div>

        <br />

        {/* GOAL DRAWERS */}
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('CreateGoalDrawer', {
                meetingId: 'mock-meeting-id-1',
              })
            }
          >
            <span>Open Create Goal Drawer</span>
          </Clickable>
        </div>
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('EditGoalDrawer', {
                goalId: 'mock-goal-id-1',
                meetingId: null,
              })
            }
          >
            <span>Open Edit Goal Drawer</span>
          </Clickable>
        </div>

        <br />

        {/* HEADLINE DRAWERS */}
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('CreateHeadlineDrawer', {
                meetingId: 'mock-meeting-id-1',
              })
            }
          >
            <span>Open Create Headline Drawer</span>
          </Clickable>
        </div>
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('EditHeadlineDrawer', {
                headlineId: 'mock-headline-id-1',
                meetingId: null,
              })
            }
          >
            <span>Open Edit Headline Drawer</span>
          </Clickable>
        </div>

        <br />

        {/* ISSUE DRAWERS */}
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('CreateIssueDrawer', {
                meetingId: 'mock-meeting-id-1',
              })
            }
          >
            <div>Open Create Issue Drawer</div>
          </Clickable>
        </div>
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('CreateIssueDrawer', {
                meetingId: 'mock-meeting-id-1',
                context: {
                  type: 'Issue',
                  title:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                  ownerId: '123',
                  ownerFullName: 'John Doe',
                  notesId: '123',
                },
              })
            }
          >
            <div>Open Create Context Aware Issue Drawer</div>
          </Clickable>
        </div>
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('EditIssueDrawer', {
                issueId: 'mock-issue-id-1',
                meetingId: null,
              })
            }
          >
            <div>Open Edit Issue Drawer</div>
          </Clickable>
        </div>
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('MergeIssuesDrawer', {
                issues: ['mock-issue-id-1', 'mock-issue-id-2'],
                meetingId: 'mock-meeting-id-1',
              })
            }
          >
            <div>Open Merge Issues Drawer</div>
          </Clickable>
        </div>

        <br />

        {/* TODO DRAWERS */}
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('CreateTodoDrawer', { meetingId: null })
            }
          >
            <div>Open Create To-do Drawer</div>
          </Clickable>
        </div>
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('CreateTodoDrawer', {
                context: {
                  type: 'Issue',
                  title:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                  ownerId: '123',
                  ownerFullName: 'John Doe',
                  notesId: '123',
                },
                meetingId: null,
              })
            }
          >
            <div>Open Create Context Aware To-do Drawer</div>
          </Clickable>
        </div>
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('EditTodoDrawer', {
                todoId: 'mock-todo-id-1',
                meetingId: 'mock-meeting-id-1',
              })
            }
          >
            <div>Open Edit To-do Drawer</div>
          </Clickable>
        </div>

        <br />

        {/* METRIC DRAWERS */}
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('CreateMetricDrawer', {
                meetingId: 'mock-meeting-id-1',
              })
            }
          >
            <div>Open Create Metric Drawer</div>
          </Clickable>
        </div>
        <div>
          <Clickable
            clicked={() =>
              openOverlazy('EditMetricDrawer', {
                meetingId: 'mock-meeting-id-1',
                metricId: 'mock-metric-id-1',
              })
            }
          >
            <div>Open Edit Metric Drawer</div>
          </Clickable>
        </div>
      </>
    </Expandable>
  )
})

const CreateDrawer = observer(function CreateDrawer() {
  const { closeDrawer } = useDrawerController()

  return (
    <Drawer
      id={EXAMPLE_CREATE_DRAWER_ID}
      showEmbeddedDrawer={false}
      type='create'
      headerText='Create Drawer'
      footerText='Create Another Item'
      onSaveClicked={() => closeDrawer()}
      closeOverlazyDrawer={() => closeDrawer()}
      drawerHasUnsavedChanges={false}
      onHandleCloseDrawerWithUnsavedChangesProtection={() => {
        // NO-OP
      }}
      onResetForm={() => {
        //NO-OP
      }}
    >
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
      <br />
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
    </Drawer>
  )
})

const EditDrawer = observer(function EditDrawer() {
  const { closeDrawer } = useDrawerController()

  return (
    <Drawer
      id={EXAMPLE_EDIT_DRAWER_ID}
      type='edit'
      showEmbeddedDrawer={false}
      headerText='Edit Drawer'
      footerText='Archive Item'
      saveState='saved'
      footerActionTextClicked={() => closeDrawer()}
      closeOverlazyDrawer={() => closeDrawer()}
      drawerHasUnsavedChanges={false}
      onHandleCloseDrawerWithUnsavedChangesProtection={() => {
        // NO-OP
      }}
      onResetForm={() => {
        //NO-OP
      }}
    >
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
    </Drawer>
  )
})

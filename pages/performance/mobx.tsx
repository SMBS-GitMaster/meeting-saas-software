/* eslint-disable react/button-has-type */
import debounce from 'lodash.debounce'
import { action, autorun, computed, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useRef } from 'react'

type StateEntry = {
  ids: Array<string>
  queryRecordEntry?: {
    filter?: {
      [key: string]: any
    }
  }
  repo: Record<string, any>
  relational?: Record<string, State>
}

type State = Record<string, StateEntry>

// keeping query records as their own observable objects separate from results states
// allows us to keep the results states as a clean recursive object
// which simplifies the code for getting results.
// without this pattern, I believe we'd need to have a different structure for relational results
// so that we wouldn't have to keep multiple copies of the same query record entry
const userQueryRecordEntry: Record<string, any> = observable({})

const userTodosQueryRecordEntry: Record<string, any> = observable({})

const makeDO = (data: Record<string, any>) => {
  const DO: Record<string, any> = observable({
    onDataReceived: (data: Record<string, any>) => {
      Object.keys(data).forEach((key) => {
        DO[key] = data[key]
      })
    },
  })

  DO.onDataReceived(data)

  return DO
}

const state: State = observable({
  users: {
    ids: ['1', '2'],
    queryRecordEntry: userQueryRecordEntry,
    repo: {
      '1': makeDO({
        id: '1',
        name: 'John Smith',
      }),
      '2': makeDO({
        id: '2',
        name: 'Sara Smith',
      }),
    },
    relational: {
      '1': {
        todos: {
          queryRecordEntry: userTodosQueryRecordEntry,
          ids: ['1', '2'],
          repo: {
            '1': makeDO({
              id: '1',
              text: 'Buy milk',
            }),
            '2': makeDO({
              id: '2',
              text: 'Buy eggs',
            }),
          },
        },
      },
      '2': {
        todos: {
          queryRecordEntry: userTodosQueryRecordEntry,
          ids: ['3'],
          repo: {
            '3': makeDO({
              id: '3',
              text: 'Buy bread',
            }),
          },
        },
      },
    },
  },
  meetings: {
    ids: ['1', '2'],
    repo: {
      '1': makeDO({
        id: '1',
        name: 'Meeting 1',
      }),
      '2': makeDO({
        id: '2',
        name: 'Meeting 2',
      }),
    },
  },
})

function getResultsForState(state: State) {
  console.log('getting results for', state)

  const results = {}
  Object.keys(state).forEach((key) => {
    const computedGetter = computed(() => {
      const resultsForThisKey: Array<any> = []

      let filteredIds = state[key].ids
      if (state[key].queryRecordEntry?.filter) {
        filteredIds = state[key].ids.filter((id) => {
          const item = state[key].repo[id]
          const filter = state[key].queryRecordEntry?.filter

          if (!filter) {
            return true
          }
          let shouldInclude = true
          Object.keys(filter).forEach((filterKey) => {
            if (item[filterKey] !== filter[filterKey]) {
              shouldInclude = false
            }
          })

          return shouldInclude
        })
      }

      filteredIds.forEach((id, index) => {
        const computedGetter = computed(() => {
          // if we just assign the item to the repo object
          // then we are assigning relational results to a DO directly
          // which results in naming collisions
          //
          // if we create a new instance by spreading the object, then we see re-render for the whole user list
          // when we update a single user name
          // since when we spread the object, the properties of the object are observed in this computation
          // which causes the computation to have to re-run when those properties change
          const item = new Proxy(state[key].repo[id], {})

          const relationalStateForThisItem = state[key].relational?.[item.id]

          if (relationalStateForThisItem) {
            Object.keys(relationalStateForThisItem).forEach((relationalKey) => {
              const computedGetterForRelationalResultsAtThisKey = computed(
                () =>
                  getResultsForState({
                    [relationalKey]: relationalStateForThisItem[relationalKey],
                  })[relationalKey]
              )

              Object.defineProperty(item, relationalKey, {
                get: () => computedGetterForRelationalResultsAtThisKey.get(),
                enumerable: true,
                configurable: true,
              })
            })
          }

          return item
        })

        Object.defineProperty(resultsForThisKey, index, {
          get: () => computedGetter.get(),
          enumerable: true,
          configurable: true,
        })
      })

      return resultsForThisKey
    })

    Object.defineProperty(results, key, {
      get: () => computedGetter.get(),
      enumerable: true,
      configurable: true,
    })
  })

  return results as Record<string, any>
}

const computedRootResults = computed(() => getResultsForState(state))

function PerformancePage() {
  console.log('rerender container')
  // console.log('results spread', { ...results })
  // console.log('results stringified', JSON.stringify(results, null, 2))

  const results = computedRootResults.get()

  const [nameSearch, setNameSearch] = React.useState('')

  const onChangeUserName = useAction(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      state.users.repo[results.users[0].id].name = e.target.value
    }
  )

  const onChangeTodoText = useAction(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      state.users.relational![results.users[0].id].todos.repo[
        results.users[0].todos[0].id
      ].text = e.target.value
    }
  )

  const onChangeUserNameFilter = useAction(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value === '') {
        delete userQueryRecordEntry.filter?.name
      } else {
        userQueryRecordEntry!.filter = {
          name: e.target.value,
        }
      }
    }
  )

  const onChangeTodoTextFilter = useAction(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value === '') {
        delete userTodosQueryRecordEntry.filter?.text
      } else {
        userTodosQueryRecordEntry!.filter = {
          text: e.target.value,
        }
      }
    }
  )

  const onAddNewRootLevelResults = useAction(() => {
    state[Math.random().toString()] = JSON.parse(JSON.stringify(state.users))
  })

  useObsEffect(() => {
    // only downside I've found is that it runs when a new user is pushed into the users array
    // similarly, every time a new item is added to a list that is accessed anywhere in this effect
    // the effect will re-run
    // can we avoid this?
    // answer: no, not without breaking any react code that maps over an array
    // to render child list item
    // for that code to work, arrays need to be replaced and not mutated
    console.log('user', JSON.stringify(results.users[0]))
  })

  const addRandomUser = useAction(() => {
    const id = Math.random().toString()
    const todoIds = [
      Math.random().toString(),
      Math.random().toString(),
      Math.random().toString(),
    ]
    state.users.ids.push(id)
    state.users.repo[id] = {
      id,
      name: `Random User ${id}`,
    }
    state.users.relational![id] = {
      todos: {
        ids: todoIds,
        repo: {
          [todoIds[0]]: {
            id: todoIds[0],
            text: `Random Todo ${todoIds[0]}`,
          },
          [todoIds[1]]: {
            id: todoIds[1],
            text: `Random Todo ${todoIds[1]}`,
          },
          [todoIds[2]]: {
            id: todoIds[2],
            text: `Random Todo ${todoIds[2]}`,
          },
        },
      },
    }
  })

  const addRandomTodo = useAction(() => {
    const id = Math.random().toString()
    const userId = results.users[0].id
    state.users.relational![userId].todos.ids.push(id)
    state.users.relational![userId].todos.repo[id] = {
      id,
      text: `Random Todo ${id}`,
    }
  })

  // verify that newly received data which extends the DO is made observable
  const addDataToUser = useAction(() => {
    const userId = results.users[0].id
    state.users.repo[userId].onDataReceived({
      address: {
        state: 'FL',
      },
    })
  })

  const onChangeUserState = useAction(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const userId = results.users[0].id
      state.users.repo[userId].address!.state = e.target.value
    }
  )

  const getTodosById = useComputed(
    () => {
      return results.users
        .map((user: any) => user.todos)
        .flat()
        .reduce(
          (acc: any, todo: any) => {
            acc[todo.id] = todo
            return acc
          },
          {} as Record<string, any>
        )
    },
    {
      name: 'getTodosById',
    }
  )

  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Performance</h1>
      </div>
      <h2>Modify state</h2>
      <button onClick={addRandomUser}>Add random user</button>
      {'  |  '}
      <button onClick={addRandomTodo}>Add random todo</button>
      {'  |  '}
      <button onClick={onAddNewRootLevelResults}>
        Add new root level results
      </button>
      {'  |  '}
      <button onClick={addDataToUser}>Add data to user</button>
      {'  |  '}
      <UserNameInput
        onChange={onChangeUserName}
        getName={() =>
          results.users[0] ? state.users.repo[results.users[0].id].name : ''
        }
        placeholder={`First user's name`}
      />
      {'  |  '}
      <UserNameInput
        onChange={onChangeUserNameFilter}
        getName={() => userQueryRecordEntry.filter?.name || ''}
        placeholder={`User name filter`}
      />
      {'  |  '}
      <UserNameInput
        onChange={onChangeUserState}
        getName={() =>
          results.users[0]
            ? state.users.repo[results.users[0].id].address?.state || ''
            : ''
        }
        placeholder={`User state`}
      />
      {'  |  '}
      <TodoTextInput
        onChange={onChangeTodoText}
        getText={() =>
          results.users[0] && results.users[0].todos[0]
            ? state.users.relational![results.users[0].id].todos.repo[
                results.users[0].todos[0].id
              ].text
            : ''
        }
        placeholder={`First user's first todo text`}
      />
      {'  |  '}
      <TodoTextInput
        onChange={onChangeTodoTextFilter}
        getText={() => userTodosQueryRecordEntry.filter?.text || ''}
        placeholder={`Todo text filter`}
      />
      {'  |  '}
      <input
        placeholder='Search by name'
        value={nameSearch}
        onChange={(e) => setNameSearch(e.target.value)}
      />
      <UsersList getUsers={() => results.users} />
      {/* Rendering todosById 4 times to ensure getTodosById only computes once */}
      <TodosById getTodosById={getTodosById} />
      <TodosById getTodosById={getTodosById} />
      <TodosById getTodosById={getTodosById} />
      <TodosById getTodosById={getTodosById} />
    </div>
  )
}

const TodosById = observer(function TodosById(props: {
  getTodosById: () => Record<string, any>
}) {
  return (
    <div>
      <br />
      <h1>Todos by id</h1>
      {Object.keys(props.getTodosById()).map((id) => (
        <div key={id}>
          <TodoDisplay todo={props.getTodosById()[id]} />
        </div>
      ))}
    </div>
  )
})

const UserNameInput = observer(function UserNameInput(props: {
  getName: () => string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}) {
  const { getName, onChange, placeholder } = props
  return (
    <input value={getName()} onChange={onChange} placeholder={placeholder} />
  )
})

const TodoTextInput = observer(function TodoTextInput(props: {
  getText: () => string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}) {
  const { getText, onChange, placeholder } = props
  return (
    <input value={getText()} onChange={onChange} placeholder={placeholder} />
  )
})

const UsersList = observer(function UsersList(props: {
  getUsers: () => Array<{
    id: string
    name: string
    address?: { state: string }
    todos: Array<{ id: string; text: string }>
  }>
}) {
  return (
    <ul>
      {props.getUsers().map((user) => (
        <li key={user.id}>
          <UserNameDisplay getName={() => user.name} />
          <UserTodosList getTodos={() => user.todos} />
          {user.address ? <div>{user.address.state}</div> : null}
        </li>
      ))}
    </ul>
  )
})

const UserNameDisplay = observer(function UserNameDisplay(props: {
  getName: () => string
}) {
  return <span>{props.getName()}</span>
})

const UserTodosList = observer(function UserTodosList(props: {
  getTodos: () => Array<{ id: string; text: string }>
}) {
  return (
    <ul>
      {props.getTodos().map((todo) => (
        <li key={todo.id}>
          <TodoTextDisplay getText={() => todo.text} />
        </li>
      ))}
    </ul>
  )
})

const TodoDisplay = observer(function TodoDisplay(props: {
  todo: { id: string; text: string }
}) {
  return <div>{props.todo.text}</div>
})

const TodoTextDisplay = observer(function TodoTextDisplay(props: {
  getText: () => string
}) {
  return <span>{props.getText()}</span>
})

export function useObservable<T extends Record<string, any>>(
  // use a function if you're reading some observable state but don't want to render every time that state changes
  // and instead only want to set the initial state for the component using this hook
  obj: T | (() => T)
): T {
  const ref = useRef<T>(null as unknown as T)

  if (!ref.current) {
    ref.current =
      typeof obj === 'function' ? observable(obj()) : observable(obj)
  }

  return ref.current
}

export function useComputed<TResult>(
  cb: () => TResult,
  opts: { name: string }
): () => TResult {
  const computedGetter = React.useRef(computed(cb, opts))
  return computedGetter.current.get.bind(computedGetter.current)
}

export function useAction<
  TArgs extends [any],
  CB extends (...args: TArgs) => void,
>(
  cb: CB,
  opts?: {
    debounceOpts?: Parameters<typeof debounce>[2] & { timeout: number }
  }
): CB {
  const actionRef = React.useRef(
    opts?.debounceOpts
      ? // debounced fns may return nothing if they are not executed
        // which is fine in this case since we're already expecting CB to return void
        (debounce(
          action(cb),
          opts.debounceOpts.timeout,
          opts.debounceOpts
        ) as unknown as CB)
      : action(cb)
  )
  return actionRef.current
}

export function useObsEffect(cb: () => void) {
  React.useEffect(() => {
    const r = autorun(cb)
    return () => r()
  }, [])
}

export function useObservablePreviousValue<TValueType>(
  getValue: () => TValueType
) {
  const state = useObservable({
    value: getValue(),
  })

  React.useEffect(() => {
    runInAction(() => {
      state.value = getValue()
    })
  })

  return state
}

const ROLLBACK_PREVENTION_TIMEOUT_MS = 2000
export function useOptimisticState<TValueType>(opts: {
  getPersistedValue: () => TValueType
  stateName: string
  rollbackPreventionTimeoutOverrideMS?: number
  onRollback: () => void
  // return true if this is a rollback
  rollbackCondition: (opts: {
    persistedValue: TValueType
    optimisticValue: TValueType
  }) => boolean
  // by default, this hook waits for the rollbackPreventionTimeout to pass before accepting the persisted value
  // this function will allow the consumer to accept the persisted value immediately if the condition is met
  acceptPersistedImmediatelyCondition?: (opts: {
    previouslyPersistedValue: TValueType
    newPersistedValue: TValueType
  }) => boolean
}) {
  const optimisticState = useObservable<{
    value: TValueType
    rollbackPreventionTimeout: Maybe<NodeJS.Timeout>
    setterCalledSinceLastPersistedValueUpdate: boolean
  }>({
    value: opts.getPersistedValue(),
    rollbackPreventionTimeout: null,
    setterCalledSinceLastPersistedValueUpdate: false,
  })

  const setter = useAction((newValue: TValueType) => {
    optimisticState.value = newValue
    optimisticState.setterCalledSinceLastPersistedValueUpdate = true

    optimisticState.rollbackPreventionTimeout &&
      clearTimeout(optimisticState.rollbackPreventionTimeout)
    optimisticState.rollbackPreventionTimeout = setTimeout(
      action(() => {
        optimisticState.rollbackPreventionTimeout = null
      }),
      opts.rollbackPreventionTimeoutOverrideMS ?? ROLLBACK_PREVENTION_TIMEOUT_MS
    )
  })

  const previousPersisted = useObservablePreviousValue(() =>
    opts.getPersistedValue()
  )

  useObsEffect(function handlePotentialRollback() {
    if (opts.getPersistedValue() !== previousPersisted.value) {
      action(() => {
        optimisticState.setterCalledSinceLastPersistedValueUpdate = false
      })()
    }

    if (optimisticState.rollbackPreventionTimeout) return

    if (opts.getPersistedValue() !== optimisticState.value) {
      action(() => {
        if (
          // it's not a rollback unless the optimistic state was set since the last persisted value update
          // if this is false, then we're simply bringing the optimistic state up to date with the persisted value
          optimisticState.setterCalledSinceLastPersistedValueUpdate &&
          // we can't assume that everytime the persistedValue doesn't strict equal the optimisticValue
          // that we need to rollback, since they can be objects
          // so we need to allow the consumer to determine if a rollback is necessary
          opts.rollbackCondition({
            persistedValue: opts.getPersistedValue(),
            optimisticValue: optimisticState.value,
          })
        ) {
          opts.onRollback()
        }
        optimisticState.value = opts.getPersistedValue()
      })()
    }
  })

  useObsEffect(function handlePotentialImmediatePersistedUpdate() {
    if (
      opts.acceptPersistedImmediatelyCondition &&
      opts.acceptPersistedImmediatelyCondition({
        previouslyPersistedValue: previousPersisted.value,
        newPersistedValue: opts.getPersistedValue(),
      })
    ) {
      action(() => {
        optimisticState.value = opts.getPersistedValue()
      })()
    }
  })

  const getter = useComputed(
    () => {
      return optimisticState.value
    },
    {
      name: opts.stateName,
    }
  )

  return {
    get: getter,
    set: setter,
  }
}

// this is somtimes than using a useEffect type callback
// when you want the function to run immediately on mount
// rather than it being postponed by useEffect
export function useRunOnceOnMount(cb: () => void) {
  const hasRun = React.useRef<boolean>(false)
  if (!hasRun.current) {
    cb()
    hasRun.current = true
  }
}

export default observer(PerformancePage)

import React, { useEffect } from 'react'
import { css } from 'styled-components'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useWindow } from '@mm/core/ssr'
import { useSafeState } from '@mm/core/ui/hooks'

import { useBloomAuthHttp } from '@mm/core-bloom/auth'

import { useTranslation } from '@mm/core-web'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import { Loading, SearchInput, Text, toREM } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { BloomHeader } from '../layout/header/bloomHeader'

type Org = {
  Id: number
  Name: string
  OrgImage: string
  OrgName: string
  IsAdmin: boolean
}

export default function SwitchOrgPage() {
  const { v1Url } = useBrowserEnvironment()
  const { t } = useTranslation()
  const [orgs, setOrgs] = useSafeState<Array<Org>>([])
  const [filteredOrgs, setFilteredOrgs] = useSafeState<Array<Org>>([])
  const [switching, setSwitching] = useSafeState(false)
  const bloomAuthHttp = useBloomAuthHttp()
  const { openOverlazy } = useOverlazyController()

  const window = useWindow()

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const response = await bloomAuthHttp.getOrgs(v1Url)
        setOrgs(response)
        setFilteredOrgs(response)
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error fetching organizations`),
          error: new UserActionError(e),
        })
      }
    }
    fetchOrgs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bloomAuthSwitchOrg = bloomAuthHttp.switchOrg
  const switchOrg = React.useCallback(
    async (orgUserId: number) => {
      setSwitching(true)
      try {
        await bloomAuthSwitchOrg({ v1Url, orgUserId })
        // refresh on the home page
        window.location.href = window.origin
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error switching organizations`),
          error: new UserActionError(error),
        })
        setSwitching(false)
      }
    },
    [bloomAuthSwitchOrg, setSwitching, t, openOverlazy, v1Url, window]
  )

  const onSearchTermChange = React.useCallback(
    (searchTerm: string) => {
      if (!searchTerm || searchTerm.length === 0) {
        setFilteredOrgs(orgs)
        return
      }
      const filtered = orgs.filter((org) =>
        org.OrgName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOrgs(filtered)
    },
    [setFilteredOrgs, orgs]
  )

  return (
    <>
      <BloomHeader
        alwaysShowBoxShadow
        title={t('Choose an organization')}
        defaultPropsForDrawers={{ meetingId: null }}
        rightSection={
          <SearchInput
            id={'side-nav-meeting-list-search'}
            name={'titleOrKeyword'}
            onSearch={onSearchTermChange}
            placeholder={t('Search by organization name')}
          />
        }
      />
      <div
        css={css`
          padding: ${(props) => props.theme.sizes.spacing24};
          width: 100%;
          position: relative;
        `}
      >
        {filteredOrgs.map((org) => (
          <button
            type='button'
            key={org.Id}
            onClick={() => switchOrg(org.Id)}
            css={css`
              padding: ${(props) => props.theme.sizes.spacing12};
              border-radius: ${(props) => props.theme.sizes.br1};
              width: 100%;
              display: flex;
              align-items: center;
              outline: 0;
              border: 0;
              cursor: pointer;
              background: none;

              &:hover,
              &:focus {
                background-color: ${(props) =>
                  props.theme.colors.buttonPrimaryBackgroundFocused};
                border-color: ${(props) =>
                  props.theme.colors.buttonPrimaryBackgroundFocused};
              }
            `}
          >
            <div
              css={css`
                height: ${toREM(50)};
                width: ${toREM(50)};
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                background-image: url(${org.OrgImage});
              `}
            />
            <Text
              css={css`
                padding: ${(props) => props.theme.sizes.spacing12};
              `}
            >
              {org.OrgName}
            </Text>
            {org.IsAdmin && (
              <Text fontStyle='italic' weight='light'>
                {t('(Admin)')}
              </Text>
            )}
          </button>
        ))}
        {switching && (
          <div
            css={css`
              position: absolute;
              z-index: 2;
              top: 0;
              left: 0;
              height: 100%;
              width: 100%;
              background-color: rgba(255, 255, 255, 0.8);
            `}
          >
            <Loading />
          </div>
        )}
      </div>
    </>
  )
}

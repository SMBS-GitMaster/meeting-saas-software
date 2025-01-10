import React from 'react'
import styled, { css } from 'styled-components'

import { ExternalPageDemo } from './ExternalPageDemo'
import { TooltipDemo } from './TooltipDemo'
import { AddExistingMetricModalDemo } from './addExistingMetricModalDemo'
import { AttendeeManagementModalDemo } from './attendeeManagementModalDemo'
import { AvatarDemo } from './avatarDemo'
import { AvatarListDemo } from './avatarListDemo'
import { BadgeDemo } from './badgeDemo'
import { BannerDemo } from './bannerDemo'
import { BloomNewFeaturesModalDemo } from './bloomNewFeaturesModalDemo'
import { BreadcrumbDemo } from './breadcrumbDemo'
import { ButtonDemo } from './buttonDemo'
import { CardDemo } from './cardDemo'
import { CommentsDemo } from './commentsDemo'
import { DatePickerDemo } from './datePickerDemo'
import { DetailsDemo } from './detailsDemo'
import { DrawerDemo } from './drawerDemo'
import { DropdownsAndFieldsDemo } from './dropdownsAndFieldsDemo'
import { FontDemo } from './fontDemo'
import { FormsArrayOfNodesDemo } from './formsArrayOfNodesDemo'
import { FormsDemo } from './formsDemo'
import { GoalsListDemo } from './goalsListDemo'
import { GridDemo } from './gridDemo'
import { HeadlinesListDemo } from './headlinesListDemo'
import { IconDemo } from './iconDemo'
import { InfiniteScrollDemo } from './infiniteScrollDemo'
import { IssueListDemo } from './issuesListDemo'
import { MeetingNotesDemo } from './meetingNotesDemo'
import { MeetingTodoListDemo } from './meetingTodoListDemo'
import { MenuDemo } from './menuDemo'
import { MetricCellNotesDemo } from './metricCellNotesDemo'
import { MetricsCellDemo } from './metricsCellDemo'
import { MetricsGraphDemo } from './metricsGraphDemo'
import { MetricsTableDemo } from './metricsTableDemo'
import { Modals } from './modalDemo'
import { NotificationCountBadgeDemo } from './notificationCountBadgeDemo'
import { PillDemo } from './pillDemo'
import { QuickAddTextInputDemo } from './quickAddTextInputDemo'
import { ResponsiveComponentsDemo } from './responsiveComponentsDemo'
import { SwitchInputDemo } from './switchInputDemo'
import { TabsDemo } from './tabsDemo'
import { TimelineDemo } from './timelineDemo'
import { ToastDemo } from './toastDemo'
import { VideoConferenceDemo } from './videoConferenceDemo'
import { WrapUpDemo } from './wrapUpDemo'

export function CLTestPage() {
  return <TestPageView />
}

function TestPageView() {
  return (
    <div
      css={css`
        padding: 0 12px;
        margin-bottom: 80px;
        width: 100%;
      `}
    >
      <AddExistingMetricModalDemo />
      <AttendeeManagementModalDemo />
      <AvatarDemo />
      <AvatarListDemo />
      <BadgeDemo />
      <BannerDemo />
      <BloomNewFeaturesModalDemo />
      <BreadcrumbDemo />
      <ButtonDemo />
      <CardDemo />
      <CommentsDemo />
      <DatePickerDemo />
      <DetailsDemo />
      <DrawerDemo />
      <DropdownsAndFieldsDemo />
      <ExternalPageDemo />
      <FontDemo />
      <FormsDemo />
      <FormsArrayOfNodesDemo />
      <GoalsListDemo />
      <GridDemo />
      <HeadlinesListDemo />
      <IconDemo />
      <InfiniteScrollDemo />
      <IssueListDemo />
      <MeetingNotesDemo />
      <MeetingTodoListDemo />
      <MenuDemo />
      <MetricCellNotesDemo />
      <MetricsCellDemo />
      <MetricsGraphDemo />
      <MetricCellNotesDemo />
      <MetricsCellDemo />
      <MetricsTableDemo />
      <MetricsGraphDemo />
      <Modals />
      <NotificationCountBadgeDemo />
      <PillDemo />
      <ResponsiveComponentsDemo />
      <QuickAddTextInputDemo />
      <SwitchInputDemo />
      <TabsDemo />
      <TimelineDemo />
      <ToastDemo />
      <TooltipDemo />
      <VideoConferenceDemo />
      <WrapUpDemo />
    </div>
  )
}

export const Divider = styled.div`
  background: black;
  display: block;
  height: 1px;
  margin: 20px 0;
  width: 100%;
`

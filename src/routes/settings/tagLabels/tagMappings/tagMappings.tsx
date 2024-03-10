import Unavailable from '@patternfly/react-component-groups/dist/esm/UnavailableContent';
import { Pagination, PaginationVariant } from '@patternfly/react-core';
import type { Query } from 'api/queries/query';
import { getQuery } from 'api/queries/query';
import type { Settings, SettingsData } from 'api/settings';
import { SettingsType } from 'api/settings';
import type { AxiosError } from 'axios';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { LoadingState } from 'routes/components/state/loadingState';
import * as queryUtils from 'routes/utils/query';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { settingsActions, settingsSelectors } from 'store/settings';

import { styles } from './tagMappings.styles';
import { TagMappingsEmptyState } from './tagMappingsEmptyState';
import { TagMappingsTable } from './tagMappingsTable';
import { TagMappingsToolbar } from './tagMappingsToolbar';

interface MappingsOwnProps {
  canWrite?: boolean;
}

export interface MappingsMapProps {
  query?: Query;
}

export interface MappingsStateProps {
  settings?: Settings;
  settingsError?: AxiosError;
  settingsStatus?: FetchStatus;
  settingsQueryString?: string;
}

type MappingsProps = MappingsOwnProps;

const baseQuery: Query = {
  limit: 10,
  offset: 0,
  filter_by: {},
  order_by: {
    parent: 'asc',
  },
};

const TagMappings: React.FC<MappingsProps> = ({ canWrite }) => {
  const [query, setQuery] = useState({ ...baseQuery });
  const { settings, settingsError, settingsStatus } = useMapToProps({
    query,
  });

  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const intl = useIntl();

  const getMappings = () => {
    if (settings) {
      return settings.data as any;
    }
    return [];
  };

  const getPagination = (isDisabled = false, isBottom = false) => {
    const count = settings?.meta ? settings.meta.count : 0;
    const limit = settings?.meta?.limit ? settings.meta.limit : baseQuery.limit;
    const offset = settings?.meta ? settings.meta.offset : baseQuery.offset;
    const page = Math.trunc(offset / limit + 1);

    return (
      <Pagination
        isCompact={!isBottom}
        isDisabled={isDisabled}
        itemCount={count}
        onPerPageSelect={(event, perPage) => handleOnPerPageSelect(perPage)}
        onSetPage={(event, pageNumber) => handleOnSetPage(pageNumber)}
        page={page}
        perPage={limit}
        titles={{
          paginationAriaLabel: intl.formatMessage(messages.paginationTitle, {
            title: intl.formatMessage(messages.openShift),
            placement: isBottom ? 'bottom' : 'top',
          }),
        }}
        variant={isBottom ? PaginationVariant.bottom : PaginationVariant.top}
        widgetId={`pagination${isBottom ? '-bottom' : ''}`}
      />
    );
  };

  const getTable = () => {
    return (
      <TagMappingsTable
        canWrite={canWrite}
        filterBy={query.filter_by}
        isDisabled={isDisabled}
        isLoading={settingsStatus === FetchStatus.inProgress}
        onDelete={handleOnDelete}
        onSort={(sortType, isSortAscending) => handleOnSort(sortType, isSortAscending)}
        orderBy={query.order_by}
        settings={settings}
      />
    );
  };

  const getToolbar = (mappings: SettingsData[]) => {
    const itemsTotal = settings?.meta ? settings.meta.count : 0;

    return (
      <TagMappingsToolbar
        canWrite={canWrite}
        isDisabled={mappings.length === 0}
        itemsPerPage={mappings.length}
        itemsTotal={itemsTotal}
        onFilterAdded={filter => handleOnFilterAdded(filter)}
        onFilterRemoved={filter => handleOnFilterRemoved(filter)}
        onWizardClose={handleOnClose}
        pagination={getPagination(isDisabled)}
        query={query}
      />
    );
  };

  const handleOnClose = () => {
    refresh();
  };

  const handleOnDelete = () => {
    dispatch(settingsActions.resetSettingsState());
    refresh();
  };

  const handleOnFilterAdded = filter => {
    const newQuery = queryUtils.handleOnFilterAdded(query, filter);
    setQuery(newQuery);
  };

  const handleOnFilterRemoved = filter => {
    const newQuery = queryUtils.handleOnFilterRemoved(query, filter);
    setQuery(newQuery);
  };

  const handleOnPerPageSelect = perPage => {
    const newQuery = queryUtils.handleOnPerPageSelect(query, perPage, true);
    setQuery(newQuery);
  };

  const handleOnSetPage = pageNumber => {
    const newQuery = queryUtils.handleOnSetPage(query, settings, pageNumber, true);
    setQuery(newQuery);
  };

  const handleOnSort = (sortType, isSortAscending) => {
    const newQuery = queryUtils.handleOnSort(query, sortType, isSortAscending);
    setQuery(newQuery);
  };

  // Force refresh
  const refresh = () => {
    setQuery({ ...query });
  };

  if (settingsError) {
    return <Unavailable />;
  }

  const mappings = getMappings();
  const isDisabled = mappings.length === 0;
  const hasMappings = mappings.length > 0 || Object.keys(query.filter_by || {}).length > 0; // filter may be applied

  return (
    <>
      <div>
        {intl.formatMessage(messages.tagMappingsDesc, {
          learnMore: (
            <a href={intl.formatMessage(messages.docsTagMappings)} rel="noreferrer" target="_blank">
              {intl.formatMessage(messages.learnMore)}
            </a>
          ),
          warning: <b>{intl.formatMessage(messages.tagMappingsWarning)}</b>,
        })}
      </div>
      {hasMappings && getToolbar(mappings)}
      {settingsStatus === FetchStatus.inProgress ? (
        <LoadingState />
      ) : hasMappings ? (
        <>
          {getTable()}
          <div style={styles.pagination}>{getPagination(isDisabled, true)}</div>
        </>
      ) : (
        <div style={styles.emptyStateContainer}>
          <TagMappingsEmptyState canWrite={canWrite} onWizardClose={refresh} />
        </div>
      )}
    </>
  );
};

// eslint-disable-next-line no-empty-pattern
const useMapToProps = ({ query }: MappingsMapProps): MappingsStateProps => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();

  const settingsQuery = {
    filter_by: query.filter_by,
    limit: query.limit,
    offset: query.offset,
    order_by: query.order_by,
  };
  const settingsQueryString = getQuery(settingsQuery);
  const settings = useSelector((state: RootState) =>
    settingsSelectors.selectSettings(state, SettingsType.tagsMappings, settingsQueryString)
  );
  const settingsStatus = useSelector((state: RootState) =>
    settingsSelectors.selectSettingsStatus(state, SettingsType.tagsMappings, settingsQueryString)
  );
  const settingsError = useSelector((state: RootState) =>
    settingsSelectors.selectSettingsError(state, SettingsType.tagsMappings, settingsQueryString)
  );

  useEffect(() => {
    if (!settingsError && settingsStatus !== FetchStatus.inProgress) {
      dispatch(settingsActions.fetchSettings(SettingsType.tagsMappings, settingsQueryString));
    }
  }, [query]);

  return {
    settings,
    settingsError,
    settingsStatus,
    settingsQueryString,
  };
};

export default TagMappings;

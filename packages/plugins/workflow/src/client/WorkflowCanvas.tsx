import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Dropdown, Menu, Button, Tag, Switch, message, Breadcrumb } from 'antd';
import { DownOutlined, RightOutlined, EllipsisOutlined } from '@ant-design/icons';
import { cx } from '@emotion/css';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import {
  ActionContext,
  ResourceActionProvider,
  SchemaComponent,
  useDocumentTitle,
  useResourceActionContext,
  useResourceContext,
} from '@nocobase/client';

import { FlowContext, useFlowContext } from './FlowContext';
import { branchBlockClass, nodeCardClass, nodeMetaClass, workflowVersionDropdownClass } from './style';
import { TriggerConfig } from './triggers';
import { Branch } from './Branch';
import { executionSchema } from './schemas/executions';
import { ExecutionLink } from './ExecutionLink';
import { lang } from './locale';
import { linkNodes } from './utils';

function ExecutionResourceProvider({ request, filter = {}, ...others }) {
  const { workflow } = useFlowContext();
  const props = {
    ...others,
    request: {
      ...request,
      params: {
        ...request?.params,
        filter: {
          ...request?.params?.filter,
          key: workflow.key,
        },
      },
    },
  };

  return <ResourceActionProvider {...props} />;
}

export function WorkflowCanvas() {
  const history = useHistory();
  const { t } = useTranslation();
  const { data, refresh, loading } = useResourceActionContext();
  const { resource } = useResourceContext();
  const { setTitle } = useDocumentTitle();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const { title } = data?.data ?? {};
    setTitle?.(`${lang('Workflow')}${title ? `: ${title}` : ''}`);
  }, [data?.data]);

  if (!data?.data && !loading) {
    return <div>{lang('Load failed')}</div>;
  }

  const { nodes = [], revisions = [], ...workflow } = data?.data ?? {};

  linkNodes(nodes);

  const entry = nodes.find((item) => !item.upstream);

  function onSwitchVersion({ key }) {
    if (key != workflow.id) {
      history.push(key);
    }
  }

  async function onToggle(value) {
    await resource.update({
      filterByTk: workflow.id,
      values: {
        enabled: value,
      },
    });
    refresh();
  }

  async function onRevision() {
    const {
      data: { data: revision },
    } = await resource.revision({
      filterByTk: workflow.id,
      filter: {
        key: workflow.key,
      },
    });
    message.success(t('Operation succeeded'));

    history.push(`${revision.id}`);
  }

  async function onMenuCommand({ key }) {
    switch (key) {
      case 'history':
        setVisible(true);
        return;
      case 'revision':
        return onRevision();
      default:
        break;
    }
  }

  const revisionable =
    workflow.executed &&
    !revisions.find((item) => !item.executed && new Date(item.createdAt) > new Date(workflow.createdAt));

  return (
    <FlowContext.Provider
      value={{
        workflow,
        nodes,
        refresh,
      }}
    >
      <div className="workflow-toolbar">
        <header>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to={`/admin/settings/workflow/workflows`}>{lang('Workflow')}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <strong>{workflow.title}</strong>
            </Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <aside>
          <div className="workflow-versions">
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu
                  onClick={onSwitchVersion}
                  defaultSelectedKeys={[`${workflow.id}`]}
                  className={cx(workflowVersionDropdownClass)}
                  items={revisions
                    .sort((a, b) => b.id - a.id)
                    .map((item, index) => ({
                      key: `${item.id}`,
                      icon: item.current ? <RightOutlined /> : null,
                      label: (
                        <span
                          className={classnames({
                            executed: item.executed,
                            unexecuted: !item.executed,
                            enabled: item.enabled,
                          })}
                        >
                          <strong>{`#${item.id}`}</strong>
                          <time>{new Date(item.createdAt).toLocaleString()}</time>
                        </span>
                      ),
                    }))}
                />
              }
            >
              <Button type="text">
                <label>{lang('Version')}</label>
                <span>{workflow?.id ? `#${workflow.id}` : null}</span>
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>
          <Switch
            checked={workflow.enabled}
            onChange={onToggle}
            checkedChildren={lang('On')}
            unCheckedChildren={lang('Off')}
          />
          <Dropdown
            overlay={
              <Menu
                items={[
                  { key: 'history', label: lang('Execution history'), disabled: !workflow.allExecuted },
                  { key: 'revision', label: lang('Copy to new version'), disabled: !revisionable },
                ]}
                onClick={onMenuCommand}
              />
            }
          >
            <Button type="text" icon={<EllipsisOutlined />} />
          </Dropdown>
          <ActionContext.Provider value={{ visible, setVisible }}>
            <SchemaComponent
              schema={executionSchema}
              components={{
                ExecutionResourceProvider,
                ExecutionLink,
              }}
            />
          </ActionContext.Provider>
        </aside>
      </div>
      <div className="workflow-canvas">
        <TriggerConfig />
        <div className={branchBlockClass}>
          <Branch entry={entry} />
        </div>
        <div className={cx('end', nodeCardClass)}>
          <div className={cx(nodeMetaClass)}>
            <Tag color="#333">{lang('End')}</Tag>
          </div>
        </div>
      </div>
    </FlowContext.Provider>
  );
}

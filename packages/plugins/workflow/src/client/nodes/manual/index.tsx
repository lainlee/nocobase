import { BlockInitializers, SchemaInitializerItemOptions } from '@nocobase/client';

import { CollectionBlockInitializer } from '../../components/CollectionBlockInitializer';
import { CollectionFieldInitializers } from '../../components/CollectionFieldInitializers';
import { filterTypedFields } from '../../variable';
import { NAMESPACE } from '../../locale';
import { SchemaConfig, SchemaConfigButton } from './SchemaConfig';
import { ModeConfig } from './ModeConfig';
import { AssigneesSelect } from './AssigneesSelect';
import { JOB_STATUS } from '../../constants';

const MULTIPLE_ASSIGNED_MODE = {
  SINGLE: Symbol('single'),
  ALL: Symbol('all'),
  ANY: Symbol('any'),
  ALL_PERCENTAGE: Symbol('all percentage'),
  ANY_PERCENTAGE: Symbol('any percentage'),
};

// TODO(optimize): change to register way
const initializerGroup = BlockInitializers.items.find((group) => group.key === 'media');
if (!initializerGroup.children.find((item) => item.key === 'workflowTodos')) {
  initializerGroup.children.push({
    key: 'workflowTodos',
    type: 'item',
    title: `{{t("Workflow todos", { ns: "${NAMESPACE}" })}}`,
    component: 'WorkflowTodoBlockInitializer',
    icon: 'CheckSquareOutlined',
  } as any);
}

export default {
  title: `{{t("Manual", { ns: "${NAMESPACE}" })}}`,
  type: 'manual',
  group: 'manual',
  fieldset: {
    assignees: {
      type: 'array',
      title: `{{t("Assignees", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'AssigneesSelect',
      'x-component-props': {
        // multiple: true,
      },
      required: true,
      default: [],
    },
    mode: {
      type: 'number',
      title: `{{t("Mode", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'ModeConfig',
      default: 1,
      'x-reactions': {
        dependencies: ['assignees'],
        fulfill: {
          state: {
            visible: '{{$deps[0].length > 1}}',
          },
        },
      },
    },
    schema: {
      type: 'void',
      title: `{{t("User interface", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'SchemaConfigButton',
      properties: {
        schema: {
          type: 'object',
          'x-component': 'SchemaConfig',
          default: null,
        },
      },
    },
    forms: {
      type: 'object',
      default: {},
    },
  },
  view: {},
  scope: {},
  components: {
    SchemaConfigButton,
    SchemaConfig,
    ModeConfig,
    AssigneesSelect,
  },
  getOptions(config, types) {
    const formKeys = Object.keys(config.forms ?? {});
    if (!formKeys.length) {
      return null;
    }

    const options = formKeys
      .map((formKey) => {
        const form = config.forms[formKey];

        const fields = (form.collection?.fields ?? []).map((field) => ({
          key: field.name,
          value: field.name,
          label: field.uiSchema.title,
          title: field.uiSchema.title,
        }));
        const filteredFields = filterTypedFields(fields, types);
        return filteredFields.length
          ? {
              key: formKey,
              value: formKey,
              label: form.title || formKey,
              title: form.title || formKey,
              children: filteredFields,
            }
          : null;
      })
      .filter(Boolean);

    return options.length ? options : null;
  },
  useInitializers(node): SchemaInitializerItemOptions | null {
    const formKeys = Object.keys(node.config.forms ?? {});
    if (!formKeys.length || node.config.mode) {
      return null;
    }

    const forms = formKeys
      .map((formKey) => {
        const form = node.config.forms[formKey];

        return form.collection?.fields?.length
          ? ({
              type: 'item',
              title: form.title ?? formKey,
              component: CollectionBlockInitializer,
              collection: form.collection,
              dataSource: `{{$jobsMapByNodeId.${node.id}.${formKey}}}`,
            } as SchemaInitializerItemOptions)
          : null;
      })
      .filter(Boolean);

    return forms.length
      ? {
          key: 'forms',
          type: 'subMenu',
          title: node.title,
          children: forms,
        }
      : null;
  },
  initializers: {
    CollectionFieldInitializers,
  },
};

import React from 'react';
import { GeneralSchemaDesigner, SchemaSettings } from '../../../schema-settings';
import { useTranslation } from 'react-i18next';
import { useFieldSchema, useField, ISchema } from '@formily/react';
import { useDesignable } from '../..';

export const ExpandActionDesign = (props) => {
  const { t } = useTranslation();
  const fieldSchema = useFieldSchema();
  const field = useField();
  const { dn } = useDesignable();
  const { titleExpand, titleCollapse, iconExpand, iconCollapse } = fieldSchema['x-component-props'] || {}

  return (
    <GeneralSchemaDesigner {...props} disableInitializer>
      <SchemaSettings.ModalItem
        title={t('Edit button')}
        schema={
          {
            type: 'object',
            title: t('Edit button'),
            properties: {
              titleExpand: {
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                title: `${t('Button title')} - ${t('Expand all')}`,
                default: titleExpand
              },
              titleCollapse: {
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                title: `${t('Button title')} - ${t('Collapse all')}`,
                default: titleCollapse
              },
              iconExpand: {
                'x-decorator': 'FormItem',
                'x-component': 'IconPicker',
                title: `${t('Button icon')} - ${t('Expand all')}`,
                default: iconExpand,
              },
              iconCollapse: {
                'x-decorator': 'FormItem',
                'x-component': 'IconPicker',
                title: `${t('Button icon')} - ${t('Collapse all')}`,
                default: iconCollapse,
              },
              type: {
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group',
                title: t('Button background color'),
                default: fieldSchema?.['x-component-props']?.danger
                  ? 'danger'
                  : fieldSchema?.['x-component-props']?.type === 'primary'
                  ? 'primary'
                  : 'default',
                enum: [
                  { value: 'default', label: '{{t("Default")}}' },
                  { value: 'primary', label: '{{t("Highlight")}}' },
                  { value: 'danger', label: '{{t("Danger red")}}' },
                ],
              },
            },
          } as ISchema
        }
        onSubmit={({ titleExpand, titleCollapse, iconExpand, iconCollapse, type }) => {
          fieldSchema.title = t('Expand/Collapse');
          field.title = t('Expand/Collapse');
          field.componentProps.icon = iconExpand;
          field.componentProps.danger = type === 'danger';
          field.componentProps.type = type;
          fieldSchema['x-component-props'] = {
            ...(fieldSchema['x-component-props'] || {}),
            titleExpand,
            titleCollapse,
            iconExpand,
            iconCollapse,
            type,
            danger: type === 'danger'
          };
          dn.emit('patch', {
            schema: {
              ...fieldSchema,
              'x-component-props': {
                ...fieldSchema['x-component-props'],
              },
            },
          });
          dn.refresh();
        }}
      />
      <SchemaSettings.Divider />
      <SchemaSettings.Remove
        removeParentsIfNoChildren
        breakRemoveOn={(s) => {
          return s['x-component'] === 'Space' || s['x-component'].endsWith('ActionBar');
        }}
        confirm={{
          title: t('Delete action'),
        }}
      />
    </GeneralSchemaDesigner>
  );
};

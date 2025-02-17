import { Schema } from '@formily/react';

// 操作记录表格操作配置
export const AuditLogsTableActionInitializers = {
  title: "{{t('Configure actions')}}",
  icon: 'SettingOutlined',
  style: {
    marginLeft: 8,
  },
  items: [
    {
      type: 'itemGroup',
      title: "{{t('Enable actions')}}",
      children: [
        {
          type: 'item',
          title: "{{t('Filter')}}",
          component: 'FilterActionInitializer',
          schema: {
            'x-align': 'left',
          },
        },
        {
          type: 'item',
          title: "{{t('Refresh')}}",
          component: 'RefreshActionInitializer',
          schema: {
            'x-align': 'right',
          },
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'item',
      title: "{{t('Association fields filter')}}",
      component: 'ActionBarAssociationFilterAction',
      schema: {
        'x-align': 'left',
      },
      find: (schema: Schema) => {
        const resultSchema = Object.entries(schema.parent.properties).find(
          ([, value]) => value['x-component'] === 'AssociationFilter',
        )?.[1];
        return resultSchema;
      },
    },
  ],
};

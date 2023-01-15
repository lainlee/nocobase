import { i18n } from '@nocobase/client';

export const pieTemplate = {
  title: 'Pie',
  type: "Pie",
  renderComponent: 'G2Plot',
  defaultChartOptions: {
    appendPadding: 10,
    angleField: '{{angleField}}',
    colorField: '{{colorField}}',
    radius: 0.9,
    label: {
      type: 'inner',
      offset: '-30%',
      content: "{{({percent}) => `${(percent * 100).toFixed(0)}%`}}",
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [{type: 'element-active'}],
  },
  configurableProperties: {
    type: 'void',
    'x-component': 'Tabs',
    'x-component-props': {
      style: {
        marginTop: -15,
      },
    },
    properties: {
      dataset: {
        type: 'object',
        title: 'Dataset options',
        'x-component': 'Tabs.TabPane',
        'x-component-props': {
          tab: 'Dataset options',
        },
        properties: {
          type: {
            title: "{{t('Type')}}",
            required: true,
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            default: 'builtIn',
            enum: [
              {label: 'Built-in', value: 'builtIn'},
              {label: 'SQL', value: 'sql'},
              {label: 'API', value: 'api'},
            ],
          },
          sql: {
            title: "{{t('SQL')}}",
            'x-component': 'Input.TextArea',
            'x-decorator': 'FormItem',
            'x-reactions': {
              dependencies: ['dataset.type'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "sql"}}',
                },
              },
            },
          },
          api: {
            title: "{{t('API')}}",
            'x-component': 'Input',
            'x-decorator': 'FormItem',
            'x-reactions': {
              dependencies: ['dataset.type'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "api"}}',
                },
              },
            },
          },
          aggregateFunction: {
            title: "{{t('Aggregate function')}}",
            required: true,
            'x-component': 'Radio.Group',
            'x-decorator': 'FormItem',
            enum: [
              {label: 'SUM', value: 'SUM'},
              {label: 'COUNT', value: 'COUNT'},
              {label: 'AVG', value: 'AVG'},
            ],
            'x-reactions': {
              dependencies: ['dataset.type'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "builtIn"}}',
                },
              },
            },
          },
          computedField: {
            title: "{{t('Computed field')}}",
            required: true,
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            enum: "{{computedFields}}",
            'x-reactions': {
              dependencies: ['dataset.type'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "builtIn"}}',
                },
              },
            },
          },
          groupByField: {
            title: "{{t('GroupBy field')}}",
            required: true,
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            enum: "{{groupByFields}}",
            'x-reactions': {
              dependencies: ['dataset.type'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "builtIn"}}',
                },
              },
            },
          },
          filter: {
            title: "{{t('Filter')}}",
            'x-component': 'Filter',
            'x-decorator': 'FormItem',
            'x-component-props': {},
            'x-reactions': {
              dependencies: ['dataset.type'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "builtIn"}}',
                },
              },
            },
          },
        },
      },
      chartOptions: {
        type: 'object',
        title: 'Chart options',
        'x-component': 'Tabs.TabPane',
        'x-component-props': {
          tab: 'Chart options',
        },
        properties: {
          title: {
            title: "{{t('Title')}}",
            'x-component': 'Input',
            'x-decorator': 'FormItem',
          },
          angleField: {
            title: "{{t('angleField')}}",
            required: true,
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            'x-reactions':(field) => {
              const computedField =  field.query('dataset.computedField')?.value();
              const groupByField =  field.query('dataset.groupByField')?.value();
              if(groupByField && computedField){
                field.dataSource = [
                  {
                    label:computedField,
                    value:computedField
                  },
                  {
                    label:groupByField,
                    value:groupByField
                  }
                ]
              }else{
                field.dataSource=[]
              }
            }
          },
          colorField: {
            title: "{{t('colorField')}}",
            required:true,
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            'x-reactions':(field) => {
              const computedField =  field.query('dataset.computedField')?.value();
              const groupByField =  field.query('dataset.groupByField')?.value();
              if(groupByField && computedField){
                field.dataSource = [
                  {
                    label:computedField,
                    value:computedField
                  },
                  {
                    label:groupByField,
                    value:groupByField
                  }
                ]
              }else{
                field.dataSource=[]
              }
            }
          },
        },
      },
    },
  }
}
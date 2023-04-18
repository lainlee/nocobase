import React, { useState } from 'react';
import { Modal, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { css } from '@emotion/css';

import { CollectionProvider, createFormBlockSchema, FormBlockProvider, RecordProvider, SchemaInitializer, useCollectionManager, useCompile } from "@nocobase/client";

import { NAMESPACE } from "../../../locale";
import { JOB_STATUS } from '../../../constants';

function CreateFormBlockProvider(props) {
  return (
    <CollectionProvider collection={props.collection}>
      <RecordProvider record={{}}>
        <FormBlockProvider {...props} />
      </RecordProvider>
    </CollectionProvider>
  );
}

function CreateFormBlockInitializer({ insert, ...props }) {
  const compile = useCompile();
  const { t } = useTranslation();
  const { collections, getCollection } = useCollectionManager();
  const [visible, setVisible] = useState(false);
  const [selectedCollection, setSelectCollection] = useState(null);

  function onOpen(options) {
    setVisible(true);
  }

  function onCollectionChange(value) {
    setSelectCollection(value);
  }

  function onSelectCollection() {
    // const collection = getCollection(selectedCollection);
    const schema = createFormBlockSchema({
      collection: selectedCollection,
      actionInitializers: 'AddActionButton',
      actions: {
        resolve: {
          type: 'void',
          title: `{{t("Continue the process", { ns: "${NAMESPACE}" })}}`,
          'x-decorator': 'ManualActionStatusProvider',
          'x-decorator-props': {
            value: JOB_STATUS.RESOLVED
          },
          'x-component': 'Action',
          'x-component-props': {
            type: 'primary',
            useAction: '{{ useSubmit }}',
          },
          'x-designer': 'Action.Designer',
          'x-action': `${JOB_STATUS.RESOLVED}`,
        }
      }
    });
    schema['x-decorator'] = 'CreateFormBlockProvider';
    // console.log(schema);
    insert(schema);
    setVisible(false);
  }

  return (
    <>
      <SchemaInitializer.Item
        {...props}
        onClick={onOpen}
      />
      <Modal
        title={t('Select collection')}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={onSelectCollection}
      >
        <Select
          value={selectedCollection}
          onChange={onCollectionChange}
          options={collections.map(item => ({
            label: compile(item.title),
            value: item.name,
          }))}
          className={css`
            width: 100%;
          `}
        />
      </Modal>
    </>
  );
}



export default {
  title: `{{t("Custom form", { ns: "${NAMESPACE}" })}}`,
  config: {
    initializer: {
      key: 'createRecordForm',
      type: 'item',
      title: '{{t("Create record form")}}',
      component: CreateFormBlockInitializer,
    },
    // initializers: {
    //   AddCustomFormField
    // },
    components: {
      CreateFormBlockProvider
    }
  },
  block: {
    scope: {
      // useFormBlockProps
    },
    components: {
      CreateFormBlockProvider
    }
  }
};

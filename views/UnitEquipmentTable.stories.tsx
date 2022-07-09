import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import UnitEquipmentTable from "./UnitEquipmentTable";
import { store } from "../data/store";
import { Provider } from "react-redux";
import { addMockData } from "../data/mock";

export default {
  title: "Army Forge/Unit Equipment Table",
  component: UnitEquipmentTable,
} as ComponentMeta<typeof UnitEquipmentTable>;

addMockData(store);

const Template: ComponentStory<typeof UnitEquipmentTable> = (args) => (
  <Provider store={store}>
    <UnitEquipmentTable {...args} />
  </Provider>
);

export const UpgradePanel = Template.bind({});
UpgradePanel.args = {
  loadout: store.getState().list.units[0].loadout,
  square: false,
  hideEquipment: false
};

export const CardView = Template.bind({});
CardView.args = {
  loadout: store.getState().list.units[0].loadout,
  square: true,
  hideEquipment: true
};

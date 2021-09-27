import { ISelectedUnit, IUpgrade, IUpgradeGains, IUpgradeOption } from '../../data/interfaces';
import EquipmentService from '../../services/EquipmentService';
import UpgradeService from '../../services/UpgradeService';
import UpgradeRadio from './controls/UpgradeRadio';
import UpgradeCheckbox from './controls/UpgradeCheckbox';
import UpgradeUpDown from './controls/UpgradeUpDown';
import { Fragment } from 'react';
import { groupBy } from '../../services/Helpers';

export default function UpgradeItem({ selectedUnit, upgrade, option }: { selectedUnit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption }) {

    const controlType = UpgradeService.getControlType(selectedUnit, upgrade);
    // Somehow display the count?
    const gainsGroups = groupBy(option.gains, "name");

    return (
        <div className="is-flex is-align-items-center">
            <div className="is-flex-grow-1 pr-2">
                
                {
                    Object.keys(gainsGroups).map((key, i) => {
                        const group: IUpgradeGains[] = gainsGroups[key];
                        const e = group[0];
                        const count = group.length
                        const parts = EquipmentService.getStringParts(e, count);
                        return (
                            <Fragment key={i}>
                                {count > 1 && <span>{count}x </span>}
                                <span style={{ color: "#000000" }}>{parts.name} </span>
                                {parts.rules && <span className="mr-2" style={{ color: "#656565" }}>({parts.rules})</span>}
                            </Fragment>
                        )
                    })
                }
            </div>
            <div>{option.cost ? `${option.cost}pts` : "Free"}&nbsp;</div>
            {(() => {
                switch (controlType) {
                    case "check": return <UpgradeCheckbox selectedUnit={selectedUnit} upgrade={upgrade} option={option} />;
                    case "radio": return <UpgradeRadio selectedUnit={selectedUnit} upgrade={upgrade} option={option} />;
                    case "updown": return <UpgradeUpDown selectedUnit={selectedUnit} upgrade={upgrade} option={option} />;
                }
            })()}
        </div>
    );
}
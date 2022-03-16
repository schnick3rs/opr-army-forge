import { Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import { ISelectedUnit, IUpgrade } from '../../data/interfaces';
import { RootState } from '../../data/store';
import UpgradeService from '../../services/UpgradeService';
import UpgradeItem from './UpgradeItem';

export default function UpgradeGroup({ unit, upgrade }: { unit: ISelectedUnit, upgrade: IUpgrade }) {

  const controlType = UpgradeService.getControlType(unit, upgrade);

  return (
    <Paper className="px-4 py-2" square elevation={0}>
      {
        // "None" / Default option for radio group
        controlType === "radio" && <UpgradeItem selectedUnit={unit} upgrade={upgrade} option={null} />
      }
      {upgrade.options.map((opt, i) => <UpgradeItem key={i} selectedUnit={unit} upgrade={upgrade} option={opt} />)}
    </Paper>
  );
}
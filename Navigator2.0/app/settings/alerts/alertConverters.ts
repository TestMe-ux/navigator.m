// alertConverters.ts
import { AlertUI, CompSet, Channel } from "./alertType";

// Convert ADR alert
export const convertToADR = (
  alert: any,
  id: number,
  compSets: CompSet[]
): AlertUI => {
  let ruleString = `${alert.WithRespectTo || ''} `;
  if (alert.WithRespectTo === 'Competitor' && alert.WRTCompsetList) {
    const list = compSets
      .filter(c => alert.WRTCompsetList?.includes(c.propertyID))
      .map(c => c.name)
      .join(', ');
    ruleString += `${list} ADR `;
  }

  ruleString += alert.AlertRule === 'Decreased' ? '< ' : '> ';
  ruleString += `${Math.round(alert.ThresholdValue || 0)} `;
  if (alert.IsPercentage) ruleString += '%';

  return {
    id,
    type: 'ADR',
    rule: ruleString,
    createdBy: alert.CreatedBy || 'Current User',
    createdOn: alert.CreatedOn || new Date().toLocaleDateString(),
    status: alert.IsActive || false,
    AlertID: alert.AlertId,
    Action: alert.Action ?? null,
  };
};

// export const convertToADR = (
//   alertBody: any,
//   id: number,
//   compSets: CompSet[]
// ): AlertUI => {
//   let ruleString = `${alertBody.WithRespectTo || ''} `;
//   if (alertBody.WithRespectTo === 'Competitor' && alertBody.WRTCompsetList) {
//     const list = compSets
//       .filter(c => alertBody.WRTCompsetList?.includes(c.propertyID))
//       .map(c => c.name)
//       .join(', ');
//     ruleString += `${list} ADR `;
//   }
//   ruleString += alertBody.AlertRule === 'Decreased' ? '< ' : '> ';
//   ruleString += `${Math.round(alertBody.ThresholdValue || 0)} `;
//   if (alertBody.IsPercentage) ruleString += '%';

//   return {
//     id,
//     type: 'ADR',
//     rule: ruleString,
//     createdBy: alertBody.CreatedBy || 'Current User',
//     createdOn: alertBody.CreatedOn || new Date().toLocaleDateString(),
//     status: alertBody.IsActive,
//     AlertID: alertBody.AlertId,
//     Action: alertBody.Action ?? null,
//   };
// };

// Convert Parity alert
export const convertToParity = (
  alert: any,
  id: number,
  channels: Channel[]
): AlertUI => {
  let ruleString = '';

  switch (alert.SelectedOption) {
    case 1:
      const channelNames1 = channels
        .filter(c => alert.ChannelList?.includes(c.cid))
        .map(c => c.name)
        .join(', ');
      ruleString = `Subscriber ${alert.AlertOn} on ${channelNames1}`;
      break;
    case 2:
      const incdec = alert.AlertOn === 'Decreased' ? '< ' : '> ';
      ruleString = `Subscriber Parity Score ${incdec}${Math.round(alert.ThresholdValue || 0)}${alert.IsPercentage ? '%' : ''}`;
      break;
    case 3:
      ruleString = `Subscriber Parity Score ${alert.AlertOn} ${Math.round(alert.ThresholdValue || 0)}`;
      break;
    default:
      ruleString = 'Parity rule';
  }

  return {
    id,
    type: 'Parity',
    rule: ruleString,
    createdBy: alert.CreatedBy || 'Current User',
    createdOn: alert.CreatedOn || new Date().toLocaleDateString(),
    status: alert.IsActive || false,
    AlertID: alert.AlertId,
    Action: alert.Action ?? null,
  };
};


// Convert OTA Ranking alert
export const convertToRank = (
  alert: any,
  id: number,
  channels: Channel[],
  compSets: CompSet[]
): AlertUI => {
  let ruleString = '';
  if (alert.AlertOn === 'Subscriber') {
    ruleString += 'Subscriber Ranking ';
  } else if (alert.CompID) {
    const compName = compSets.find(c => c.propertyID === alert.CompID)?.name;
    ruleString += `${compName} Ranking `;
  }

  ruleString += alert.AlertRule === 'Decreased' ? '< ' : '> ';
  ruleString += `${Math.round(alert.ThresholdValue || 0)} `;

  if (alert.ChannelList?.length) {
    const channelNames = channels
      .filter(c => alert.ChannelList?.includes(c.cid))
      .map(c => c.name)
      .join(', ');
    ruleString += `on ${channelNames}`;
  } else if (alert.Channel) {
    const channelName = channels.find(c => c.cid === alert.Channel)?.name;
    if (channelName) ruleString += `on ${channelName}`;
  }

  return {
    id,
    type: 'OTA Ranking',
    rule: ruleString,
    createdBy: alert.CreatedBy || 'Current User',
    createdOn: alert.CreatedOn || new Date().toLocaleDateString(),
    status: alert.IsActive || false,
    AlertID: alert.AlertId,
    Action: alert.Action ?? null,
  };
};


// Main conversion function
export const convertAlertsToUI = (
  alerts: any[],
  isHistory: boolean,
  compSets: CompSet[],
  channels: Channel[]
): AlertUI[] => {
  return alerts
    .map((alert, index) => {
      const id = index + 1;
      switch (alert.AlertType) {
        case 'ADR':
          return convertToADR(alert, id, compSets);
        case 'Parity':
          return convertToParity(alert, id, channels);
        case 'OTA Ranking':
          return convertToRank(alert, id, channels, compSets);
        default:
          return null;
      }
    })
    .filter((a): a is AlertUI => a !== null);
};



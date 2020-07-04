import * as _ from "lodash";
import moment from "moment";
import React from "react";
import Calendar from "react-calendar";
import { caretBack, caretForward, playBack, playForward } from "ionicons/icons";
import { IonIcon, IonPopover } from "@ionic/react";

import "./ScannerCalendar.scss";

interface ScannerCalendarProps {
  calendarAnchor: null | undefined | Event;
  selectedDate: Date;
  removeCalendarAnchor: () => void;
  onDateChange: (date: Date) => void;
  maxDate?: Date;
  minDate?: Date;
}
export const ScannerCalendar = (props: ScannerCalendarProps) => {
  const {
    calendarAnchor,
    removeCalendarAnchor,
    selectedDate,
    onDateChange,
    maxDate,
    minDate,
  } = props;

  return (
    <IonPopover
      cssClass="scanner-calendar-popover"
      isOpen={!_.isEmpty(calendarAnchor)}
      event={!_.isNull(calendarAnchor) ? calendarAnchor : undefined}
      onDidDismiss={() => removeCalendarAnchor()}
      showBackdrop={false}
    >
      <Calendar
        className="scanner-custom-calendar"
        value={selectedDate}
        onChange={(date: Date | Date[]) => {
          onDateChange(date as Date);
          removeCalendarAnchor();
        }}
        calendarType="US"
        minDetail="year"
        maxDate={maxDate}
        prevLabel={<IonIcon mode="md" icon={caretBack} />}
        nextLabel={<IonIcon mode="md" icon={caretForward} />}
        prev2Label={<IonIcon mode="md" icon={playBack} />}
        next2Label={<IonIcon mode="md" icon={playForward} />}
        formatShortWeekday={(local: string, date: Date) => {
          const weekday = moment(date).format("ddd")[0];
          return weekday;
        }}
        tileClassName="scanner-profile-calendar-tile"
      />
    </IonPopover>
  );
};

import * as _ from "lodash";
import { caretDown } from "ionicons/icons";
import React, { useState, useEffect } from "react";
import { IonLabel, IonInput, IonList, IonIcon, IonSpinner } from "@ionic/react";

import "./ScannerDropdownSelect.scss";

export interface ScannerDropdownSelectOption {
  id: string;
  name: string;
  metadata?: any;
}
interface ScannerDropdownSelectProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  onSelectItem?: (item: ScannerDropdownSelectOption) => void;
  options: ScannerDropdownSelectOption[] | null;
  selectFromOptionsRequired?: boolean;
  readonly?: boolean;
  error?: string;
  disabled?: boolean;
  disableTab?: boolean;
  emptyOptionLabel?: string;
  placeholder?: string;
}
export const ScannerDropdownSelect = (props: ScannerDropdownSelectProps) => {
  const {
    label,
    value,
    onChange,
    onSelectItem,
    error,
    options,
    selectFromOptionsRequired,
    disableTab,
    disabled,
    readonly,
    emptyOptionLabel,
    placeholder,
  } = props;
  const [hasFocus, setHasFocus] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [listOptions, setListOptions] = useState(
    null as ScannerDropdownSelectOption[] | null
  );
  const [rawOptions, setRawOptions] = useState(
    [] as ScannerDropdownSelectOption[]
  );
  const [itemGettingClicked, setItemGettingClicked] = useState(false);

  useEffect(() => {
    if (options !== undefined && !_.isNull(options)) {
      const newOptionsIdentifier = options.map((option) => option.id).join("");
      const oldOptionsIdentifier = rawOptions
        .map((option) => option.id)
        .join("");

      if (newOptionsIdentifier !== oldOptionsIdentifier) {
        // setRawOptions(_.sortBy(options, "name", "desc"));
        setRawOptions(options);
        if (_.isEmpty(value)) {
          setListOptions(null);
        }
      }
    } else {
      setRawOptions([]);
      setListOptions(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <>
      <div className="wc-dropdown-select-item ion-no-padding ion-no-margin">
        {label !== undefined && (
          <IonLabel
            className={`wc-dropdown-select-label wc-paragraph bold ${
              hasFocus && !readonly && "has-focus"
            } ${!!error && "has-error"}`}
            position="stacked"
          >
            {label}
          </IonLabel>
        )}
        <div className="wc-dropdow-select-input-list-container">
          <IonInput
            {...(readonly !== undefined && { readonly: readonly })}
            className={`wc-dropdown-select-input ${hasFocus && "has-focus"} ${
              !!error && "has-error"
            } wc-body`}
            {...(placeholder !== undefined && { placeholder })}
            type="text"
            value={value}
            onIonChange={(event) => {
              if (onChange !== undefined) {
                const strValue = event.detail.value || "";
                onChange(strValue);

                const filteredOptions = _.filter(
                  rawOptions,
                  (option) =>
                    option.name
                      .trim()
                      .toLowerCase()
                      .indexOf(strValue.trim().toLowerCase()) !== -1
                );

                const hasExactSearch =
                  filteredOptions.length === 1 &&
                  filteredOptions[0].name === strValue;

                setListOptions(
                  !_.isNull(rawOptions)
                    ? !_.isEmpty(strValue) &&
                      !hasExactSearch &&
                      !_.isEmpty(filteredOptions)
                      ? filteredOptions
                      : rawOptions
                    : []
                );
              } else {
                event.preventDefault();
              }
            }}
            disabled={disabled}
            autocomplete="off"
            onIonFocus={() => {
              setHasFocus(true);
              setIsOpen(true);
            }}
            onIonBlur={() => {
              if (!itemGettingClicked) {
                setIsOpen(false);
              }
              setHasFocus(false);
            }}
            {...(disableTab && {
              onKeyDown: (event: React.KeyboardEvent) => {
                if (event.keyCode === 9) {
                  event.preventDefault();
                }
              },
            })}
          >
            {_.isNull(options) ? (
              <IonSpinner className="wc-dropdown-spinner" />
            ) : (
              selectFromOptionsRequired && (
                <IonIcon className="wc-dropdown-select-icon" icon={caretDown} />
              )
            )}
          </IonInput>
          {!readonly &&
            !!isOpen &&
            (!_.isEmpty(
              !_.isNull(listOptions)
                ? listOptions
                : !_.isNull(rawOptions)
                ? rawOptions
                : []
            ) ||
              !_.isEmpty(emptyOptionLabel)) && (
              <IonList
                className="wc-dropdown-select-list"
                onBlur={() => {
                  if (!selectFromOptionsRequired) {
                    setIsOpen(false);
                  }
                }}
              >
                {!_.isEmpty(listOptions) || !_.isEmpty(rawOptions) ? (
                  (!_.isNull(listOptions)
                    ? listOptions
                    : !_.isNull(rawOptions)
                    ? rawOptions
                    : []
                  ).map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="wc-dropdown-select-list-container ion-no-padding ion-no-margin"
                        onClick={() => {
                          if (onSelectItem !== undefined) {
                            onSelectItem(item);
                          }
                          setIsOpen(false);
                        }}
                        onMouseOver={() => {
                          setItemGettingClicked(true);
                        }}
                        onMouseLeave={() => {
                          setItemGettingClicked(false);
                        }}
                      >
                        <IonLabel className="wc-dropdown-select-list-label wc-body ion-no-padding ion-no-margin">
                          {item.name}
                        </IonLabel>
                      </div>
                    );
                  })
                ) : (
                  <div className="wc-dropdown-select-list-container ion-no-padding ion-no-margin">
                    <IonLabel className="wc-dropdown-select-list-label wc-body ion-no-padding ion-no-margin">
                      {emptyOptionLabel || ""}
                    </IonLabel>
                  </div>
                )}
              </IonList>
            )}
        </div>
      </div>
      {!!error && (
        <div className="ion-text-start">
          <IonLabel className="wc-dropdown-select-error-label wc-h6 small has-error ion ion-no-margin ion-no-padding">
            {error}
          </IonLabel>
        </div>
      )}
    </>
  );
};

import { defineStore } from 'pinia'
import type Color from 'color'

export enum Modals {
  ImportScript = 'importScript',
  ExportOption = 'exportOption',
  ExportProgress = 'exportProgress',
  ColorPicker = 'colorPicker',
  None = ''
}

type ModalDataMap = {
  [Modals.ImportScript]: {
    importText: string | null;
  };
  [Modals.ExportOption]: null;
  [Modals.ExportProgress]: {
    targetDir: string;
    formatter: ((scriptIndex: number) => string) | null;
  }
  [Modals.ColorPicker]: {
    target: Color | null;
    callback: ((c: Color) => void) | null;
  };
  [Modals.None]: undefined;
}

export type ModalData<T extends Modals> = ModalDataMap[T]

export const useModalStore = defineStore('modal', {
  state: () => ({
    activeModal: Modals.None,
    data: undefined as ModalDataMap[Modals]
  }),

  actions: {
    open <T extends Modals> (modal: T, data: ModalDataMap[T]) {
      this.activeModal = modal
      this.data = { ...data } as ModalDataMap[T]
    },
    close () {
      this.open(Modals.None, undefined)
    },
    updateData <T extends Modals> (modal: T, data: Partial<ModalDataMap[T]>) {
      if (this.activeModal !== modal) {
        throw new Error(`The requested type of modal, "${modal}", doesn't match with the active modal, "${this.activeModal}".`)
      }
      this.data = { ...(this.data as ModalDataMap[T]), ...data }
    }
  }
})

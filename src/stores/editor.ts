import { defineStore } from 'pinia'

/**
 * Store for managing the Rete.js editor state
 */
export const useEditorStore = defineStore('editor', {
  state: () => ({
    editor: null as any, // Will be typed properly when Rete.js editor is initialized
    contextMenuVisible: false,
    contextMenuPosition: { x: 0, y: 0 },
    zoom: 1,
    pan: { x: 0, y: 0 }
  }),

  getters: {
    isEditorReady: (state) => state.editor !== null
  },

  actions: {
    setEditor(editor: any) {
      this.editor = editor
    },

    showContextMenu(x: number, y: number) {
      this.contextMenuVisible = true
      this.contextMenuPosition = { x, y }
    },

    hideContextMenu() {
      this.contextMenuVisible = false
    },

    setZoom(zoom: number) {
      this.zoom = zoom
    },

    setPan(x: number, y: number) {
      this.pan = { x, y }
    },

    clearEditor() {
      this.editor = null
    }
  }
})

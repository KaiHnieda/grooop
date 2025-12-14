import { Node, mergeAttributes } from '@tiptap/core';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
  types: string[];
}

// Type declarations for TipTap Commands
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (options: { type: string }) => ReturnType;
      toggleCallout: (options: { type: string }) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  addOptions() {
    return {
      HTMLAttributes: {},
      types: ['info', 'warning', 'success', 'error'],
    };
  },

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-type'),
        renderHTML: (attributes) => {
          if (!attributes.type) {
            return {};
          }
          return {
            'data-type': attributes.type,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type || 'info';
    const baseClasses = 'callout';
    const typeClasses = `callout-${type}`;

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `${baseClasses} ${typeClasses}`,
        'data-type': type,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (options) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, options);
        },
      toggleCallout:
        (options) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, options);
        },
    };
  },
});


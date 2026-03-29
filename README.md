# <p align='center'> polytree </p>

Traverses any AST, nodes of which have `type` property.

### Usage

Overview

```typescript
import { traverse } from 'polytree';

// `traverse` is iterative function so there are not problems with AST depth
traverse<N, P>( // `N` - type of node, `P` - type of parent
    node, // Root node to be traversed

    (node, parent?, key?) => {}, // Called on every entrance to node. Can be `null`

    (node, parent?, key?) => {}, // Called when all children of a node are traversed. Can be `null`

    parent, // Parent of root node (optional)
    key, // Key of node in `parent` (optional)
);
```

To replace a node, return a new node

```typescript
import { traverse } from 'polytree';

traverse(
    node,

    (node) => {
        if (node.type === 'Identifier' && node.name === 'foo') {
            return { type: 'Identifier', name: 'bar' };
        }
    },
    null,
);
```

To manually replace a node (for example, after traversal), use `parent` and `key` arguments of visitor

```typescript
import { traverse } from 'polytree';

traverse(
    node,

    (
        node,
        parent /* It is `null` if there is not a parent of node */,
        key /* It is an empty string if `parent` is null */,
    ) => {
        if (
            node.type === 'Identifier' &&
            node.name === 'foo' &&
            parent &&
            key
        ) {
            parent[key] = { type: 'Identifier', name: 'bar' };
        }
    },
);
```

To fully skip a node, return `SKIP` constant in `onEnter`

```typescript
import { traverse, SKIP } from 'polytree';

traverse(
    node,

    (node) => (node.type.includes('JSX') ? SKIP : null), // ✅ Return skip only from `onEnter`

    (node) => (node.type.includes('JSX') ? SKIP : null), // ❌ `SKIP` should not be returned from `onExit`
);
```

Return `STOP` constant to stop `traverse` function

```typescript
import { traverse, STOP } from 'polytree';

traverse(
    node,
    (node) => (node.type === 'Bad' ? STOP : null), // ✅
    (node) => (node.type === 'Bad' ? STOP : null), // ✅
);
```

`parent` and `key` usage

```typescript
// There is a `JSXExpressionContainer`
// The task is to replace `foo` identifiers with `bar` identifiers in `JSXExpressionContainer.expression`

// It might seem to be a problem, because if `foo` identifier is the `JSXExpressionContainer.expression`
// itself, replacing will not do anything

// `parent` and `key` parameters are used to solve it

import { traverse } from 'polytree';

const jsxExpressionContainer = {
    type: 'JSXExpressionContainer',
    expression: {
        /* ... */
    },
};

traverse(
    jsxExpressionContainer.expression,

    (node) =>
        node.type === 'Identifier' && node.name === 'foo'
            ? { type: 'Identifier', name: 'bar' }
            : null,
    null,

    jsxExpressionContainer, // `parent`

    'expression', // `key`
);
```

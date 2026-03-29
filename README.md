# <p align='center'> polytree </p>

Traverses any AST, nodes of which have `type` property.

### Usage

```typescript
import { traverse } from 'polytree';

// `traverse` is iterative function so there are not problems with AST depth
traverse<T, P>( // `T` - type of node, `P` - type of parent
    node, // Root node to be traversed

    (node) => {}, // Called on every entrance to node. Can be `null`

    (node) => {}, // Called when all properties and children of a node are traversed. Can be `null`

    parent, // Parent (optional)

    key, // Key of node in `parent` (optional)
);
```

To replace a node, return a new node

```typescript
import { traverse } from 'polytree';

traverse(
    node,

    (node) =>
        node.type === 'Identifier' && node.name === 'foo'
            ? { type: 'Identifier', name: 'bar' }
            : null,
    null,
);
```

Return `SKIP` constant in `onEnter` to fully skip a node

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

    /* ... */
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

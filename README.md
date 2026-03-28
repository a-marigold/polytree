# <p align='center'> polytree </p>

Traverses any AST, nodes of which have `type` property.

```typescript
import { traverse } from 'polytree';

// Traverse is fully iterative function, so there are not problems with depth
traverse<T, P>( // `T` - type of node, `P` - type of parent
    node, // Root node to be traversed

    () => {}, // Called on every entrance to node
    () => {}, // Called when all properties and children of a node are traversed. Can be `null`

    parent, // Parent
    key, // Key of node in `parent`
);
```

To replace a node

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

To skip a node immersion

```typescript
import { traverse, SKIP } from 'polytree';

// ✅ Return `SKIP` only in `onEnter`
traverse(node, (node) => (node.type.includes('JSX') ? SKIP : null), null);

// ❌ `SKIP` should not be returned from `onExit`
// It can cause unexpected behaviour
traverse(
    node,

    () => {},

    (node) => (node.type.includes('JSX') ? SKIP : null), // ❌
);
```

To stop `traverse` function

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
// There is `JSXExpressionContainer`
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

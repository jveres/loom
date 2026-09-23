# Loom 0.7.0

Version 0.7.0 adds `morphChildren(parent, snapshot, options)` to `loom/dom`. It
reconciles a parent's children against an array of child nodes and returns the
matched live nodes. Existing children in the snapshot are retained without
traversing their subtrees; detached nodes supply changed content. An HTML
renderer can then parse only the fragments that changed while Loom owns
matching, insertion, removal, and positioning. Protected-node matching and
positioning are shared with `morph`.

The release adds no breaking changes. The full `loom/dom` family grows from
9,845 to 10,142 bytes gzip, and its reviewed budget rises from 9,984 to 10,240
bytes. See the [API index](api.md) for the `morphChildren` contract. Install
from the GitHub tag with `pnpm add github:jveres/loom#v0.7.0`.

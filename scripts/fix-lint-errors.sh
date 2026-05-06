#!/bin/bash

# Fix all escaped quotes in JSX
find app -name "*.tsx" -type f -exec sed -i "s/don't/don\&apos;t/g" {} \;
find app -name "*.tsx" -type f -exec sed -i 's/"\([^"]*\)"/\&quot;\1\&quot;/g' {} \;

# Remove unused error variables
find app -name "*.tsx" -type f -exec sed -i 's/, error//g' {} \;
find components -name "*.tsx" -type f -exec sed -i 's/, error//g' {} \;

# Remove unused workspaceId parameters
find app -name "*.tsx" -type f -exec sed -i 's/workspaceId,//g' {} \;
find app -name "*.tsx" -type f -exec sed -i 's/workspaceId: string,//g' {} \;

echo "Lint fixes applied!"

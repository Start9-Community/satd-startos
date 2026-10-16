ARCHES := x86 arm
# overrides to s9pk.mk must precede the include statement
# The type check also runs test/, which checks the networks against satd-init.
TS_CHECK := npm run check
include node_modules/@start9labs/start-sdk/s9pk.mk

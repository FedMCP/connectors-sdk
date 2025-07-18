module github.com/fedmcp/fedmcp/cli

go 1.21

require (
	github.com/fedmcp/fedmcp/core/go v0.2.0
	github.com/google/uuid v1.5.0
	github.com/spf13/cobra v1.8.0
)

require (
	github.com/inconshreveable/mousetrap v1.1.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
)

replace github.com/fedmcp/fedmcp/core/go => ../core/go
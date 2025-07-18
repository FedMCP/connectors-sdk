package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	fedmcp "github.com/fedmcp/fedmcp/core/go/pkg/fedmcp"
	"github.com/google/uuid"
	"github.com/spf13/cobra"
)

var (
	workspaceID string
	serverURL   string
)

func main() {
	var rootCmd = &cobra.Command{
		Use:   "fedmcp",
		Short: "FedMCP CLI - Federal Model Context Protocol",
		Long:  `CLI tool for creating, signing, and verifying FedMCP artifacts`,
	}

	rootCmd.PersistentFlags().StringVar(&workspaceID, "workspace", "", "Workspace UUID")
	rootCmd.PersistentFlags().StringVar(&serverURL, "server", "http://localhost:8090", "FedMCP server URL")

	// Commands
	rootCmd.AddCommand(createCmd())
	rootCmd.AddCommand(signCmd())
	rootCmd.AddCommand(verifyCmd())
	rootCmd.AddCommand(pushCmd())

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func createCmd() *cobra.Command {
	var artifactType string
	var version int
	
	cmd := &cobra.Command{
		Use:   "create [json-file]",
		Short: "Create a new FedMCP artifact",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			// Read JSON body
			data, err := ioutil.ReadFile(args[0])
			if err != nil {
				return err
			}

			var jsonBody map[string]interface{}
			if err := json.Unmarshal(data, &jsonBody); err != nil {
				return err
			}

			// Parse workspace ID
			wsID, err := uuid.Parse(workspaceID)
			if err != nil {
				return fmt.Errorf("invalid workspace ID: %w", err)
			}

			// Create artifact
			artifact := fedmcp.NewArtifact(artifactType, wsID, jsonBody)
			artifact.Version = version

			// Output as JSON
			output, _ := json.MarshalIndent(artifact, "", "  ")
			fmt.Println(string(output))

			return nil
		},
	}

	cmd.Flags().StringVarP(&artifactType, "type", "t", "", "Artifact type")
	cmd.Flags().IntVarP(&version, "version", "v", 1, "Artifact version")
	cmd.MarkFlagRequired("type")

	return cmd
}

func signCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "sign [artifact-file]",
		Short: "Sign an artifact locally",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			// Read artifact
			data, err := ioutil.ReadFile(args[0])
			if err != nil {
				return err
			}

			var artifact fedmcp.Artifact
			if err := json.Unmarshal(data, &artifact); err != nil {
				return err
			}

			// Create local signer
			signer, err := fedmcp.NewLocalSigner()
			if err != nil {
				return err
			}

			// Sign artifact
			jws, err := signer.Sign(&artifact)
			if err != nil {
				return err
			}

			// Output
			fmt.Printf("Artifact ID: %s\n", artifact.ID)
			fmt.Printf("JWS: %s\n", jws)
			fmt.Printf("Key ID: %s\n", signer.GetKeyID())

			return nil
		},
	}
}

func verifyCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "verify [artifact-file] [jws]",
		Short: "Verify an artifact signature",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			// Implementation similar to above
			fmt.Println("Verification not yet implemented")
			return nil
		},
	}
}

func pushCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "push [artifact-file]",
		Short: "Push artifact to FedMCP server",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			// Implementation to push to server
			fmt.Printf("Pushing to %s\n", serverURL)
			return nil
		},
	}
}
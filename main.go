package main

import (
	"context"
	"embed"

	"github.com/luc-git/go-ios/ios"
	"github.com/luc-git/go-ios/ios/afc"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	var afcconnection *afc.Connection

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "fileexplorer",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnDomReady: func(ctx context.Context) {
			afcconnection = setup(ctx, afcconnection, app)
			runtime.EventsOn(ctx, "refresh", func(optionalData ...interface{}) {
				if afcconnection == nil{
					afcconnection = setup(ctx, afcconnection, app)
				}
			})
		},
		OnShutdown: func(ctx context.Context) {
			app.shutdown(ctx, afcconnection)
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

func setup(ctx context.Context, afcconnection *afc.Connection, app *App) *afc.Connection{
	idevice, err := ios.GetDevice("")
	if err != nil {
		runtime.EventsEmit(ctx, "idevice", err.Error(), false)
		return nil
	}
	afcconnection, err = afc.New(idevice)
	if err != nil {
		return nil
	}
	runtime.EventsEmit(ctx, "idevice", "idevice found", true)
	app.newAfc(ctx, afcconnection, idevice)
	return afcconnection
}

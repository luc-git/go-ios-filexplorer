package main

import (
	"context"

	"github.com/danielpaulus/go-ios/ios"
	"github.com/luc-git/go-ios/ios/afc"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	runtime.EventsOn(ctx, "refresh", func(optionalData ...interface{})  {
		a.NewAfc(ctx)
	})
}

// Greet returns a greeting for the given name
func (a *App) NewAfc(ctx context.Context) {
	idevice, err := ios.GetDevice("")
	if err != nil {
		runtime.EventsEmit(ctx, "idevice", err.Error())
		return
	}
	afc.New(idevice)
	runtime.EventsEmit(ctx, "idevice", "idevice found")
}

package main

import (
	"context"
	"fmt"
	"path"

	"github.com/danielpaulus/go-ios/ios"
	"github.com/luc-git/go-ios/ios/afc"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var afcconnection *afc.Connection

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
	runtime.EventsOn(ctx, "refresh", func(optionalData ...interface{}) {
		a.NewAfc(ctx)
	})
}

// Greet returns a greeting for the given name
func (a *App) NewAfc(ctx context.Context) {
	if afcconnection != nil {
		runtime.EventsEmit(ctx, "idevice", "idevice found", true)
		return
	}
	idevice, err := ios.GetDevice("")
	if err != nil {
		runtime.EventsEmit(ctx, "idevice", err.Error(), false)
		return
	}
	afcconnection, err = afc.New(idevice)
	if err != nil {
		return
	}
	runtime.EventsEmit(ctx, "idevice", "idevice found", true)
	runtime.EventsOn(ctx, "getfiles", func(optionalData ...interface{}) {
		getFiles(afcconnection, ctx, optionalData...)
	})
}

func getFiles(afcconnection *afc.Connection, ctx context.Context, iospath ...interface{}) {
	files, err := afcconnection.ListFiles(iospath[0].(string), "*")

	fmt.Printf(iospath[0].(string) + "\n")
	if err != nil {
		fmt.Printf(err.Error())
		return
	}
	for _, f := range files {
		fmt.Printf(path.Join(iospath[0].(string), f))
		stat, err := afcconnection.Stat(path.Join(iospath[0].(string), f))
		if err != nil {
			fmt.Printf(err.Error())
			continue
		}
		if stat.IsDir() {
			runtime.EventsEmit(ctx, "directories", f, true)
		} else {
			runtime.EventsEmit(ctx, "directories", f, false)
		}
	}
}

package main

import (
	"context"
	"fmt"
	"path"
	"strings"

	"github.com/danielpaulus/go-ios/ios"
	"github.com/luc-git/go-ios/ios/afc"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var afcconnection *afc.Connection

var completepath []string

var dstpath string

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
	completepath = make([]string, 0)
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
	runtime.EventsOn(ctx, "copyto", func(optionalData ...interface{}) {
		copyIos(ctx, optionalData...)
	})
}

func copyIos(ctx context.Context, iospath ...interface{}) {
	var err error
	fmt.Print(iospath[1])
	if iospath[1].(float64) == 0 {
		fmt.Printf("HELLOOOOOOOO")
		dstpath, err = runtime.OpenDirectoryDialog(ctx, runtime.OpenDialogOptions{
			Title: "copy to",
		})
		fmt.Printf(dstpath)
		if err != nil {
			fmt.Printf(err.Error())
			return
		}
	}
	fmt.Printf(iospath[0].(string))
	err = afcconnection.Pull(path.Join(strings.Join(completepath, ""), iospath[0].(string)), path.Join(dstpath, iospath[0].(string)))
	if err != nil {
		fmt.Printf(err.Error())
	}
	runtime.EventsEmit(ctx, "copyfinished", iospath[1])
}

func getFiles(afcconnection *afc.Connection, ctx context.Context, iospath ...interface{}) {
	if iospath[0].(string) == ".." {
		completepath = completepath[:len(completepath)-1]
	} else {
		completepath = append(completepath, iospath[0].(string)+"/")
	}
	files, err := afcconnection.ListFiles(strings.Join(completepath, ""), "*")

	fmt.Println(strings.Join(completepath, ""))
	if err != nil {
		fmt.Printf(err.Error())
		return
	}
	for _, f := range files {
		stat, err := afcconnection.Stat(path.Join(strings.Join(completepath, ""), f))
		//fmt.Printf("files: " + f + "\n")
		if err != nil {
			fmt.Printf(err.Error() + " HEREEEE " + f + "\n")
			continue
		} else if f == "." {
			continue
		}
		runtime.EventsEmit(ctx, "pathlist", f, stat.IsDir())
	}
}

func (a *App) shutdown(ctx context.Context) {
	if afcconnection != nil {
		afcconnection.Close()
	}
}

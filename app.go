package main

import (
	"context"
	"fmt"
	"path"
	"strings"
	"sync"

	"github.com/luc-git/go-ios/ios"
	"github.com/luc-git/go-ios/ios/afc"

	"github.com/luc-git/go-ios/ios/installationproxy"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var mutex sync.Mutex

var dstpath string

var housearrestconnection *afc.Connection

const (
	Directory int = 0
	File      int = 1
	Iosapp    int = 2
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// Greet returns a greeting for the given name
func (a *App) newAfc(ctx context.Context, afcconnection *afc.Connection, idevice ios.DeviceEntry) {
	completepath := []string{}
	iosproxy, err := installationproxy.New(idevice)
	if err != nil {
		fmt.Printf(err.Error())
		return
	}
	sharingapps, err := iosproxy.BrowseAllApps()
	if err != nil {
		fmt.Printf(err.Error())
		return
	}
	runtime.EventsEmit(ctx, "idevice", "idevice found", true)
	loadappDir(idevice, sharingapps)
	eventRegister(ctx, completepath, sharingapps, idevice, afcconnection)
}

func eventRegister(ctx context.Context, completepath []string, sharingapps []installationproxy.AppInfo, idevice ios.DeviceEntry, afcconnection *afc.Connection) {
	var filesharingapps bool = false
	runtime.EventsOn(ctx, "connecttoapp", func(optionalData ...interface{}) {
		runtime.EventsEmit(ctx, "clearpage")
		completepath = []string{}
		completepath = append(completepath, "Documents/")
		if housearrestconnection == nil {
			housearrestconnection = newHouseArrest(idevice, ctx, completepath, optionalData...)
		} else {
			housearrestconnection.Close()
			housearrestconnection = newHouseArrest(idevice, ctx, completepath, optionalData...)
		}
	})
	runtime.EventsOn(ctx, "getapps", func(optionalData ...interface{}) {
		filesharingapps = true
		getapps(sharingapps, ctx)
	})
	runtime.EventsOn(ctx, "getfiles", func(optionalData ...interface{}) {
		filesharingapps = optionalData[1].(bool)
		completepath = completePathEdit(completepath, optionalData[0].(string))
		if filesharingapps && len(completepath) == 0 {
			getapps(sharingapps, ctx)
			return
		}
		if filesharingapps {
			getFiles(housearrestconnection, ctx, completepath)
		} else {
			getFiles(afcconnection, ctx, completepath)
		}
	})
	runtime.EventsOn(ctx, "copyto", func(optionalData ...interface{}) {
		if filesharingapps {
			copyIos(housearrestconnection, ctx, completepath, optionalData...)
		} else {
			copyIos(afcconnection, ctx, completepath, optionalData...)
		}
	})
	runtime.EventsOn(ctx, "renamepath", func(optionalData ...interface{}) {
		if filesharingapps {
			housearrestconnection.RenamePath(pathToString(completepath)+optionalData[0].(string), pathToString(completepath)+optionalData[1].(string))
		} else {
			afcconnection.RenamePath(pathToString(completepath)+optionalData[0].(string), pathToString(completepath)+optionalData[1].(string))
		}
	})
	runtime.EventsOn(ctx, "addfiles", func(optionalData ...interface{}) {
		if filesharingapps {
			addFiles(housearrestconnection, ctx, completepath)
		} else {
			addFiles(afcconnection, ctx, completepath)
		}
	})
}

func copyIos(afcconnection *afc.Connection, ctx context.Context, completepath []string, iospath ...interface{}) {
	fmt.Print(iospath[1])
	var err error
	mutex.Lock()
	defer mutex.Unlock()
	if iospath[1].(bool) {
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
	err = afcconnection.Pull(pathToString(completepath)+iospath[0].(string), path.Join(dstpath, iospath[0].(string)))
	if err != nil {
		fmt.Printf(err.Error())
	}
	//runtime.EventsEmit(ctx, "copyfinished", iospath[1])
}

func addFiles(afccconnection *afc.Connection, ctx context.Context, completepath []string) {
	srcpath, err := runtime.OpenMultipleFilesDialog(ctx, runtime.OpenDialogOptions{
		Title: "add files",
	})
	if err != nil {
		fmt.Printf(err.Error())
		return
	}
	for _, file := range srcpath {
		err = afccconnection.Push(file, pathToString(completepath))
		if err != nil {
			fmt.Printf(err.Error())
			continue
		}
	}
	getFiles(afccconnection, ctx, completepath)
}

func completePathEdit(completepath []string, path string) []string {
	switch path {
	case "..":
		completepath = completepath[:len(completepath)-1]
	case "":
		completepath = []string{}
	default:
		completepath = append(completepath, path+"/")
	}
	return completepath
}

func getFiles(afcconnection *afc.Connection, ctx context.Context, completepath []string) {
	runtime.EventsEmit(ctx, "clearpage")
	files, err := afcconnection.ListFiles(pathToString(completepath), "*")
	fmt.Print(files)
	if err != nil {
		fmt.Printf(err.Error())
		return
	}
	for _, f := range files {
		stat, err := afcconnection.Stat(pathToString(completepath) + f)
		if err != nil {
			continue
		} else if f == "." {
			continue
		}
		if stat.IsDir() {
			runtime.EventsEmit(ctx, "pathlist", f, Directory, "")
		} else {
			runtime.EventsEmit(ctx, "pathlist", f, File, "")
		}
	}
}

func (a *App) shutdown(ctx context.Context, afcconnection *afc.Connection) {
	if afcconnection != nil {
		afcconnection.Close()
	}
	housearrestClose()
}

func pathToString(completepath []string) string {
	return strings.Join(completepath, "/")
}

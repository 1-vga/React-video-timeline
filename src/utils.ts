import { Clip } from "./clip";
import { MIN_RULER_WIDTH_SECONDS, RULER_CLEARANCE } from "./constants";

export const areRectanglesOverlapped = (targetItem: Clip, iteratedItem: Clip) => {
    let [left1, top1, right1, bottom1] = [targetItem.left, targetItem.top, targetItem.right, targetItem.bottom],
        [left2, top2, right2, bottom2] = [iteratedItem.left, iteratedItem.top, iteratedItem.right, iteratedItem.bottom];

    if (top1 !== top2 || bottom1 !== bottom2) {
        return false;
    }
    // The first rectangle is to the left of the second or vice versa
    if (right1 < left2 || right2 < left1) {
        return false;
    }

    return true;
}

export const getRulerClearence = (duration: number) => {
    if(duration >= MIN_RULER_WIDTH_SECONDS) {
        return duration += (duration / 100 * RULER_CLEARANCE)
    } else {
        return MIN_RULER_WIDTH_SECONDS
    }
}

export const importFileandPreview = (file: File, revoke?: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
        window.URL = window.URL || window.webkitURL;
        let preview = window.URL.createObjectURL(file);
        // remove reference
        if (revoke) {
            window.URL.revokeObjectURL(preview);
        }
        resolve(preview);
    });
};

const generateVideoDurationFromUrl = (url: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        let video = document.createElement("video");
        video.addEventListener("loadeddata", function () {
            resolve(video.duration);
            window.URL.revokeObjectURL(url);
        });
        video.preload = "metadata";
        video.src = url;
        // Load video in Safari / IE11
        video.muted = true;
        video.crossOrigin = "Anonymous";
        video.playsInline = true;
        video.play();
    })
}

export const getVideoDurationFromVideoFile = (videoFile: File | string): Promise<number> => {
    return new Promise((resolve, reject) => {
        try {
            if (videoFile) {
                if ((videoFile as File)?.type?.match("video")) {
                    importFileandPreview(videoFile as File).then((url) => {
                        generateVideoDurationFromUrl(url).then((res) => {
                            resolve(res);
                        })
                    });
                } else {
                    generateVideoDurationFromUrl(videoFile as string).then((res) => {
                        resolve(res)
                    })
                }
            } else {
                reject("Cannot generate video duration for this video file.");
            }
        } catch (error) {
            reject(error);
        }
    });
};

export const getVideoCover = (urlOfFIle: string, seekTo = 0.0): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            // load the file to a video player
            const videoPlayer = document.createElement('video');
            // videoPlayer.setAttribute('src', URL.createObjectURL(urlOfFIle));
            videoPlayer.setAttribute('src', urlOfFIle);
            videoPlayer.crossOrigin = "Anonymous";
            videoPlayer.load();
            videoPlayer.addEventListener('error', (ex) => {
                reject(`error when loading video file ${ex}`);
            });
            // load metadata of the video to get video duration and dimensions
            videoPlayer.addEventListener('loadedmetadata', () => {
                // seek to user defined timestamp (in seconds) if possible
                if (videoPlayer.duration < seekTo) {
                    reject("video is too short.");
                    return;
                }
                // delay seeking or else 'seeked' event won't fire on Safari
                // setTimeout(() => {
                    videoPlayer.currentTime = seekTo;
                // }, 200);
                // extract video thumbnail once seeking is complete
                videoPlayer.addEventListener('seeked', () => {
                    // console.log('video is now paused at %ss.', seekTo);
                    // define a canvas to have the same dimension as the video
                    const canvas = document.createElement("canvas");
                    canvas.width = videoPlayer.videoWidth;
                    canvas.height = videoPlayer.videoHeight;
                    // draw the video frame to canvas
                    const ctx = canvas.getContext("2d");
                    ctx!.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                    // return the canvas image as a blob
                    // then convert it to base 64
                    ctx!.canvas.toBlob(
                        blob => {
                            var reader = new FileReader();
                            reader.readAsDataURL(blob as Blob);
                            reader.onloadend = function () {
                                var base64data = reader.result;
                                resolve(base64data as string);
                            }
                        },
                        "image/jpeg",
                        1 /* quality */
                    );
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

const getVideoThumbnail = (file: File | string, videoTimeInSeconds: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        if ((file as File)?.type?.match("video")) {
            importFileandPreview(file as File).then((urlOfFIle) => {
                getVideoCover(urlOfFIle, videoTimeInSeconds).then((res) => {
                    resolve(res);
                })
            });
        } else if (file) {
            getVideoCover(file as string, videoTimeInSeconds).then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err);
            })
        }
        else {
            reject("file not valid");
        }
    });
};

export const generateVideoThumbnails = async (videoFile: File, numberOfThumbnails: number, type: string): Promise<string[]> => {
    let thumbnail: string[] = [];
    let fractions: number[] = [];
    return type !== "url" ? new Promise(async (resolve, reject) => {
        if (!videoFile.type?.includes("video")) reject("not a valid video file");
        await getVideoDurationFromVideoFile(videoFile).then(async (duration) => {
            // divide the video timing into particular timestamps in respective to number of thumbnails
            // ex if time is 10 and numOfthumbnails is 4 then result will be -> 0, 2.5, 5, 7.5 ,10
            // we will use this timestamp to take snapshots
            for (let i = 0; i < duration; i += duration / numberOfThumbnails) {
                fractions.push(Math.floor(i));
            }
            // the array of promises
            let promiseArray = fractions.map((time, index) => getVideoThumbnail(videoFile, index >= fractions.length - 1 ? time - 2 : time));
            // console.log('promiseArray', promiseArray)
            // console.log('duration', duration)
            // console.log('fractions', fractions)
            await Promise.all(promiseArray).then((res) => {
                res.forEach((res) => {
                    // console.log('res', res.slice(0,8))
                    thumbnail.push(res);
                });
                // console.log('thumbnail', thumbnail)
                resolve(thumbnail);
            }).catch((err) => {
                reject(err)
            }).finally(() => resolve(thumbnail))
        }).catch((err) => {
            reject(err);
        })
        reject("something went wrong");
    })
        : new Promise(async (resolve, reject) => {
            await getVideoDurationFromVideoFile(videoFile).then(async (duration) => {
                console.log('duration', duration)
                // divide the video timing into particular timestamps in respective to number of thumbnails
                // ex if time is 10 and numOfthumbnails is 4 then result will be -> 0, 2.5, 5, 7.5 ,10
                // we will use this timestamp to take snapshots
                for (let i = 0; i <= duration; i += duration / numberOfThumbnails) {
                    fractions.push(Math.floor(i));
                }
                // the array of promises
                let promiseArray = fractions.map((time, index) => getVideoThumbnail(videoFile, index >= fractions.length - 1 ? time - 2 : time))
                // console.log('promiseArray', promiseArray)
                // console.log('duration', duration)
                // console.log('fractions', fractions)
                await Promise.all(promiseArray).then((res) => {
                    res.forEach((res) => {
                        // console.log('res', res.slice(0,8))
                        thumbnail.push(res);
                    });
                    // console.log('thumbnail', thumbnail)
                    resolve(thumbnail);
                }).catch((err) => {
                    reject(err);
                }).finally(() => resolve(thumbnail));
            });
            reject("something went wrong");
        });
};

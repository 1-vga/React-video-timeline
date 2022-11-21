import { v4 as uuidv4 } from 'uuid';
import { ZOOM_STEP, DEFAULT_DURATION, ROW_HEIGHT,MIN_RULER_WIDTH_PX,MIN_RULER_WIDTH_SECONDS } from './constants';
import { getVideoDurationFromVideoFile, generateVideoThumbnails } from './utils';

const THUMBNAILS_NUMBER = 3;
export class Clip {
    public id: string;
    public height: number;
    public file: File;
    public duration: number;
    public ready: Promise<any>;

    public get top(): number {
        return this.rowIndex * ROW_HEIGHT;
    }
    public set top(pixels: number) { // dynamic scenario
        this.rowIndex = Math.round(pixels / ROW_HEIGHT)
    }

    private _rowIndex: number = 0;
    public get rowIndex(): number {
        return this._rowIndex;
    }
    public set rowIndex(index: number) { // static scenario: 0,1,2,3  
        this._rowIndex = index;
    }

    private _startTime: number = 0;
    public get startTime(): number {
        return this._startTime
    }
    public set startTime(seconds:number) {
        this._startTime = seconds
    }
    
    async calcVideoDuration() {
        return await getVideoDurationFromVideoFile(this.file);
    }

    // private _minRulerWidthPx: number = MIN_RULER_WIDTH_PX;
    // public get minRulerWidthPx() {
    //     return this._minRulerWidthPx;
    // }
    // public set minRulerWidthPx(updatedWidth: number) {
    //     this._minRulerWidthPx = updatedWidth;
    // }
 
    public get left(): number {
        // return this.startTime * this.zoom * this.minRulerWidthPx / MIN_RULER_WIDTH_SECONDS; 
        return this.startTime * this.zoom * MIN_RULER_WIDTH_PX / MIN_RULER_WIDTH_SECONDS; 
    }
    public set left(pixels: number) {
        // this.startTime = pixels / (this.zoom * MIN_RULER_WIDTH_PX / MIN_RULER_WIDTH_SECONDS); 
        this.startTime = pixels / (this.zoom * MIN_RULER_WIDTH_PX / MIN_RULER_WIDTH_SECONDS); 
    }

    public get bottom(): number {
        return this.top + this.height;
    }

    public get right(): number {
        return this.left + this.width; 
    }

    /* returns pixels */
    public get width(): number {
        // return (this.startTime + this.duration) * (this.zoom * MIN_RULER_WIDTH_PX / MIN_RULER_WIDTH_SECONDS)
        return this.duration * (this.zoom * MIN_RULER_WIDTH_PX / MIN_RULER_WIDTH_SECONDS)
    }

    private _thumbnails: string[] = [];
    public get thumbnails(): string[] {
        return this._thumbnails
    }
    public  set thumbnails(data: string[]) {
        this._thumbnails = data;
    }
    
    private _zoom: number = 1;
    public get zoom(): number {
        return this._zoom;
    }
    public set zoom(value: number) {
        this._zoom = value;
        this.ready = new Promise(async (resolve, reject) => {
            try {
                this.thumbnails = await generateVideoThumbnails(this.file, (THUMBNAILS_NUMBER * this.zoom), "file");
                resolve(this);
            } catch (ex) {
                reject(ex);
            }
        })
    }

    constructor(file: File, left: number, top: number, height: number, zoom: number, startTime: number, rowIndex: number) {
        this.file = file;
        this.duration = 0;
        this.id = uuidv4();
        this.left = left;
        this.top = top;
        this.height = height;
        this.zoom = zoom;
        this.startTime = startTime;
        this.rowIndex = rowIndex;
        this.ready = new Promise(async (resolve, reject) => {
            try {
                this.duration = await this.calcVideoDuration();
                this.thumbnails = await generateVideoThumbnails(this.file, (THUMBNAILS_NUMBER * this.zoom), "file");
                resolve(this);
            } catch (ex) {
                reject(ex);
            }
        });
    }
}

#Requires AutoHotkey v2.0
; AHK v2 JS to Bookmarklet Converter (GUI & Drag-Drop)
; Cung cấp bởi Linh 📸🦞 cho anh Johnny.
; Hỗ trợ Unicode, Kéo thả file JS, và Ctrl+Shift+C.

; Khởi tạo GUI
MyGui := Gui("+AlwaysOnTop", "JS to Bookmarklet Converter 📸🦞")
MyGui.SetFont("s10", "Segoe UI")
MyGui.Add("Text", "Center w350", "Kéo thả file .js vào đây`nhoặc Copy code rồi nhấn Ctrl+Shift+C")
EditBox := MyGui.Add("Edit", "r10 w350 ReadOnly vStatus", "Sẵn sàng...")
MyGui.Add("Button", "Default w80", "Thoát").OnEvent("Click", (*) => ExitApp())

; Cho phép kéo thả file
MyGui.OnEvent("DropFiles", OnDropFiles)
MyGui.Show()

; Hotkey xử lý Clipboard
^+c:: {
    ProcessJS(A_Clipboard)
}

; Xử lý khi kéo thả file
OnDropFiles(GuiObj, GuiCtrl, FileArray, *) {
    for filePath in FileArray {
        if (StrLower(SubStr(filePath, -3)) = ".js") {
            try {
                content := FileRead(filePath, "UTF-8")
                ProcessJS(content, filePath)
                return ; Chỉ xử lý file đầu tiên nếu kéo nhiều
            } catch Error as err {
                UpdateStatus("Lỗi đọc file: " err.Message)
            }
        } else {
            UpdateStatus("Vui lòng chỉ kéo thả file .js!")
        }
    }
}

; Hàm xử lý chính
ProcessJS(input, sourceName := "Clipboard") {
    try {
        if (input = "") {
            UpdateStatus("Nội dung trống!")
            return
        }

        js_code := input
        ; 1. Loại bỏ comment nhiều dòng (/*...*/)
        js_code := RegExReplace(js_code, "s)/\*.*?\*/", "")
        ; 2. Loại bỏ comment một dòng (//...) 
        js_code := RegExReplace(js_code, "m)//.*$", "")
        ; 3. Nén dòng và khoảng trắng
        js_code := RegExReplace(js_code, "[\r\n]+", " ")
        js_code := RegExReplace(js_code, "\s{2,}", " ")
        ; 4. Xóa space xung quanh ký tự đặc biệt
        special_chars := "{}\(\)\[\];:,\=\+\-\*/<>"
        js_code := RegExReplace(js_code, "\s*([" special_chars "])\s*", "$1")
        ; 5. Trim và thêm prefix
        js_code := Trim(js_code)
        if !RegExMatch(js_code, "^javascript:")
            js_code := "javascript:" js_code
        
        A_Clipboard := js_code
        
        UpdateStatus("Thành công!`nNguồn: " sourceName "`nĐộ dài: " StrLen(js_code) " ký tự.`n`nĐã lưu vào Clipboard.")
    } catch Error as err {
        UpdateStatus("Có lỗi: " err.Message)
    }
}

UpdateStatus(msg) {
    EditBox.Value := msg
}

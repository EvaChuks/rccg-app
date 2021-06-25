tinymce.init({
    selector: 'textarea.my-expressjs-tinymce-app',
    height: 500,
    menubar: 'table',
    /* style */
    style_formats: [
        {
            title: "Headers", items: [
                { title: "Header 1", format: "h1" },
                { title: "Header 2", format: "h2" },
                { title: "Header 3", format: "h3" },
                { title: "Header 4", format: "h4" },
                { title: "Header 5", format: "h5" },
                { title: "Header 6", format: "h6" }
            ]
        },
        {
            title: "Inline", items: [
                { title: "Bold", icon: "bold", format: "bold" },
                { title: "Italic", icon: "italic", format: "italic" },
                { title: "Underline", icon: "underline", format: "underline" },
                { title: "Strikethrough", icon: "strikethrough", format: "strikethrough" },
                { title: "Superscript", icon: "superscript", format: "superscript" },
                { title: "Subscript", icon: "subscript", format: "subscript" },
                { title: "Code", icon: "code", format: "code" }
            ]
        },
        {
            title: "Blocks", items: [
                { title: "Paragraph", format: "p" },
                { title: "Blockquote", format: "blockquote" },
                { title: "Div", format: "div" },
                { title: "Pre", format: "pre" }
            ]
        },
        {
            title: "Alignment", items: [
                { title: "Left", icon: "alignleft", format: "alignleft" },
                { title: "Center", icon: "aligncenter", format: "aligncenter" },
                { title: "Right", icon: "alignright", format: "alignright" },
                { title: "Justify", icon: "alignjustify", format: "alignjustify" }
            ]
        }
    ],
    plugins: [
        "advlist autolink link image lists charmap print preview hr anchor pagebreak",
        "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
        "save table contextmenu directionality emoticons template paste textcolor"
    ],

    /* toolbar */
    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons",


    // toc_depth: 3,
    // content_style: "p { margin: 0; }",
    // plugins: [
    //     'advlist autolink lists link image charmap print preview anchor',
    //     'searchreplace visualblocks code fullscreen',
    //     'insertdatetime media table paste code help wordcount',
    //     'table toc insert'
    // ],
    // toolbar: 'undo redo | formatselect | ' +
    //     'bold italic backcolor | alignleft aligncenter ' +
    //     'alignright alignjustify | bullist numlist outdent indent | ' +
    //     'removeformat | help' +
    //     'table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol' +
    //     'toc',
    // table_class_list: [
    //     { title: 'None', value: '' },
    //     { title: 'No Borders', value: 'table_no_borders' },
    //     { title: 'Red borders', value: 'table_red_borders' },
    //     { title: 'Blue borders', value: 'table_blue_borders' },
    //     { title: 'Green borders', value: 'table_green_borders' }
    // ]

});

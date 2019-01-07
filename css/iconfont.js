;(function(window) {

  var svgSprite = '<svg>' +
    '' +
    '<symbol id="icon-beijing" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M22.144 952.064l992.704 0 0 61.504-992.704 0 0-61.504Z"  ></path>' +
    '' +
    '<path d="M22.144 885.952l992.704 0 0 42.368-992.704 0 0-42.368Z"  ></path>' +
    '' +
    '<path d="M39.616 513.6l40.832 0 0 372.992-40.832 0 0-372.992Z"  ></path>' +
    '' +
    '<path d="M289.92 357.632l34.176 0 0 528.896-34.176 0 0-528.896Z"  ></path>' +
    '' +
    '<path d="M708.352 356.864l38.912 0 0 536.576-38.912 0 0-536.576Z"  ></path>' +
    '' +
    '<path d="M956.864 513.152l36.352 0 0 377.792-36.352 0 0-377.792Z"  ></path>' +
    '' +
    '<path d="M22.144 456l270.208 0 0 61.696-270.208 0 0-61.696Z"  ></path>' +
    '' +
    '<path d="M747.008 456l267.904 0 0 61.696-267.904 0 0-61.696Z"  ></path>' +
    '' +
    '<path d="M116.608 561.792l44.096 0 0 121.408-44.096 0 0-121.408Z"  ></path>' +
    '' +
    '<path d="M205.44 561.408l44.096 0 0 121.472-44.096 0 0-121.472Z"  ></path>' +
    '' +
    '<path d="M116.608 730.752l44.096 0 0 112.192-44.096 0 0-112.192Z"  ></path>' +
    '' +
    '<path d="M205.44 730.752l44.096 0 0 112.192-44.096 0 0-112.192Z"  ></path>' +
    '' +
    '<path d="M786.176 560.576l46.208 0 0 123.712-46.208 0 0-123.712Z"  ></path>' +
    '' +
    '<path d="M378.752 420.8l53.632 0 0 92.224-53.632 0 0-92.224Z"  ></path>' +
    '' +
    '<path d="M487.68 420.8l57.728 0 0 92.928-57.728 0 0-92.928Z"  ></path>' +
    '' +
    '<path d="M599.616 420.8l54.016 0 0 92.224-54.016 0 0-92.224Z"  ></path>' +
    '' +
    '<path d="M381.056 560.704l53.696 0 0 121.216-53.696 0 0-121.216Z"  ></path>' +
    '' +
    '<path d="M489.984 560.704l57.664 0 0 122.176-57.664 0 0-122.176Z"  ></path>' +
    '' +
    '<path d="M601.92 560.704l54.016 0 0 121.216-54.016 0 0-121.216Z"  ></path>' +
    '' +
    '<path d="M381.376 731.008l53.76 0 0 111.104-53.76 0 0-111.104Z"  ></path>' +
    '' +
    '<path d="M490.304 731.008l57.728 0 0 111.936-57.728 0 0-111.936Z"  ></path>' +
    '' +
    '<path d="M602.304 731.008l54.016 0 0 111.104-54.016 0 0-111.104Z"  ></path>' +
    '' +
    '<path d="M867.52 560.576l46.464 0 0 123.712-46.464 0 0-123.712Z"  ></path>' +
    '' +
    '<path d="M786.176 731.008l46.208 0 0 112.512-46.208 0 0-112.512Z"  ></path>' +
    '' +
    '<path d="M867.52 731.008l46.464 0 0 112.512-46.464 0 0-112.512Z"  ></path>' +
    '' +
    '<path d="M235.968 379.072 235.968 317.888 513.088 270.464 798.016 318.4 798.016 379.072 516.544 329.536Z"  ></path>' +
    '' +
    '<path d="M367.104 177.472c0 0 23.296 3.52 55.552-6.976 0 0 52.416-16.96 83.392-17.6l0 90.432 20.48 0L526.528 47.168c0 0-2.752-10.432-11.136-10.24 0 0-8.064 0.192-10.624 9.728L504.64 63.424c0 0-57.664 6.656-72.64 13.888 0 0-36.608 11.904-64.96 11.52L367.04 177.472z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-china" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M902.4 189.865c12.8 0 25.6 0 44.8 0 6.4 12.8 12.8 25.6 19.2 32 19.2-12.8 38.4-25.6 57.6-32 0 12.8 0 25.6 0 32 0 0-6.4 0-6.4 0 0 19.2 0 32 0 51.2-19.2 0-19.2 6.4-32 6.4 6.4 19.2 6.4 32 6.4 64-6.4 0-12.8-6.4-19.2-6.4-12.8 12.8 6.4 19.2-25.6 25.6 0 6.4 0 12.8 0 19.2-6.4 0-19.2 0-25.6 0-12.8 19.2-19.2 19.2-25.6 44.8-38.4 0-44.8 19.2-64 32 0-6.4 0-19.2 0-25.6 0 0 6.4 0 6.4 0 0-6.4 0-19.2 0-25.6-6.4 0-12.8 0-19.2 0-6.4 19.2-19.2 38.4-32 51.2-6.4 0-12.8 0-19.2 0-6.4 6.4 6.4 6.4 6.4 6.4 12.8 12.8 0 6.4 19.2 6.4 0 6.4 0 12.8 0 19.2 6.4 0 12.8 0 19.2 0 0-6.4 6.4-12.8 6.4-19.2 12.8 0 25.6 6.4 44.8 6.4 0 6.4 0 12.8 0 19.2-6.4 0-19.2 0-25.6 0-12.8 25.6-19.2 12.8-25.6 51.2 19.2 12.8 32 25.6 32 51.2 6.4 0 12.8 0 19.2 0 0 6.4-6.4 19.2-6.4 25.6 0 0 6.4 0 6.4 0 0 0 0 6.4 0 6.4 0 0-6.4 0-6.4 0 0 0 0 6.4 0 6.4 0 6.4 32 12.8 19.2 44.8-6.4 0-12.8 6.4-19.2 6.4 0 6.4 0 19.2 0 25.6 0 0-6.4 0-6.4 0-6.4 12.8-6.4 19.2-6.4 44.8-6.4 0-12.8 0-19.2 0 0 6.4 0 12.8 0 19.2-6.4 0-12.8 0-19.2 0-6.4 25.6-19.2 38.4-44.8 44.8 0 0 0 6.4 0 6.4-12.8 0-25.6 0-32 0 0 6.4 0 12.8 0 19.2-19.2-6.4 0-6.4-6.4-19.2 0 0-6.4 0-6.4 0 0 6.4 0 12.8 0 19.2-12.8 12.8-51.2 12.8-70.4 19.2 0 0 0 6.4 0 6.4 25.6 19.2 12.8 25.6 6.4 51.2-12.8 0-32 6.4-44.8 6.4 0-12.8 0-25.6 0-32 6.4 0 19.2-6.4 25.6-6.4 0-6.4-6.4-19.2-6.4-25.6-19.2 0-38.4-6.4-57.6-6.4 0-6.4 0-19.2 0-25.6-38.4-6.4-51.2 0-102.4 0 0 12.8 0 25.6 0 32 0 0-6.4 0-6.4 0-19.2-25.6-12.8-6.4-32-19.2-6.4-12.8-6.4-12.8-19.2-19.2 0 0 0-6.4 0-6.4 0 0 6.4 0 6.4 0 0-6.4-6.4-19.2-6.4-32-6.4 0-19.2 0-25.6 0 6.4-25.6 6.4-25.6 19.2-44.8 0 0 6.4 0 6.4 0 12.8-19.2-6.4-44.8-6.4-64-25.6 19.2-19.2 6.4-19.2 25.6-25.6-6.4-19.2-12.8-44.8-19.2-12.8 19.2-32 25.6-64 25.6-6.4-12.8-6.4-12.8-12.8-32-19.2 0-32-6.4-44.8-6.4 0 6.4 0 12.8 0 19.2-19.2-6.4-19.2-6.4-6.4-19.2-19.2 0-38.4-6.4-57.6-6.4 0-6.4-6.4-12.8-6.4-19.2-12.8-6.4-19.2-6.4-25.6-12.8-19.2-25.6-12.8-44.8-57.6-51.2-12.8-32-25.6-32-25.6-76.8 6.4 0 12.8 6.4 19.2 6.4 0-19.2 0-32 0-51.2 0 0-6.4 0-6.4 0 0-6.4 6.4-12.8 6.4-19.2 0 0-6.4 0-6.4 0-25.6-19.2-32 0-32-51.2-6.4 0-12.8 0-19.2 0 0-6.4 0-12.8 0-19.2 6.4 0 12.8 6.4 19.2 6.4 0-6.4 0-19.2 0-25.6-12.8-6.4-12.8 0-19.2-19.2 19.2-12.8 25.6-19.2 51.2-25.6 0 6.4 0 12.8 0 19.2 25.6-6.4 57.6-12.8 89.6-19.2 6.4-38.4 19.2-19.2 6.4-64 6.4 0 19.2 0 25.6 0 0 0 0-6.4 0-6.4 6.4 0 12.8 6.4 19.2 6.4 0-6.4 0-12.8 0-19.2 6.4 0 12.8-6.4 19.2-6.4 0 0 0-6.4 0-6.4 6.4-12.8 0 0 6.4-6.4 12.8 19.2 6.4 12.8 32 19.2 0-6.4 0-19.2 0-25.6 0 0 6.4 0 6.4 0 12.8-12.8 12.8-12.8 32-19.2 12.8 38.4 38.4 32 44.8 89.6-12.8 12.8-6.4 0-6.4 19.2 44.8 6.4 70.4 25.6 76.8 70.4 25.6 0 51.2 6.4 76.8 6.4 0 0 0 6.4 0 6.4 6.4 0 12.8 0 19.2 0 0 0 0 6.4 0 6.4 12.8 0 25.6 6.4 44.8 6.4 0 0 0 6.4 0 6.4 6.4 0 19.2-6.4 25.6-6.4 0 0 0-6.4 0-6.4 19.2 0 38.4 0 57.6 0 12.8-12.8 19.2-19.2 25.6-32 6.4 0 12.8 0 19.2 0 0-6.4-12.8-19.2-6.4-32 0 0 6.4 0 6.4 0 0 0 0-6.4 0-6.4 38.4 12.8 32 0 70.4-6.4 0-6.4 0-12.8 0-19.2 19.2 0 32-6.4 51.2-6.4 0-6.4-6.4-19.2-6.4-25.6-32 0-38.4 12.8-51.2 0 0 0-6.4 0-6.4 0 0-12.8 6.4-32 6.4-44.8 12.8 0 25.6 0 32 0 0-12.8 0-19.2 0-32 0 0 6.4 0 6.4 0 0-6.4 0-12.8 0-19.2 0 0 6.4 0 6.4 0 6.4-19.2-6.4-25.6-6.4-32 0 0 6.4 0 6.4 0 19.2-19.2 44.8-19.2 76.8-19.2 12.8 32 32 44.8 44.8 83.2zM876.8 759.465c6.4 0 12.8 6.4 19.2 6.4-6.4 25.6-12.8 51.2-19.2 76.8 0 0-6.4 0-6.4 0-12.8-25.6-12.8-12.8-19.2-51.2 6.4-6.4 19.2-19.2 25.6-32z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-airport" viewBox="0 0 1280 1024">' +
    '' +
    '<path d="M795.306667 472.746667l62.293333-6.4c-2.56 8.106667-4.266667 17.066667-4.266667 26.026667 0 40.533333 29.866667 73.386667 66.133333 73.386667 36.693333 0 66.56-32.853333 66.56-73.386667 0-14.08-3.84-27.306667-10.24-38.4l206.08-21.76L1280 387.84 796.586667 387.84c-4.693333-20.48-13.226667-39.68-23.893333-57.6l98.133333 0 74.666667-37.973333-202.24 0c-21.76-22.186667-46.506667-38.826667-70.4-46.506667L651.52 0l-17.493333 0-15.786667 245.76c-24.746667 7.253333-50.346667 23.893333-71.68 46.506667L340.053333 292.266667l75.093333 37.973333 102.826667 0c-10.666667 17.92-18.773333 37.12-23.466667 57.6L0 387.84l103.68 50.773333 203.946667 19.2c-5.12 10.24-7.68 22.186667-7.68 34.56 0 40.533333 29.44 73.386667 66.133333 73.386667 36.693333 0 66.56-32.853333 66.56-73.386667 0-8.106667-1.28-15.786667-3.413333-23.04l67.413333 6.4C516.266667 546.133333 575.573333 597.333333 645.973333 597.333333 716.8 597.333333 776.96 544.853333 795.306667 472.746667z"  ></path>' +
    '' +
    '<path d="M0 1024 513.706667 1024 607.146667 682.666667 443.733333 682.666667Z"  ></path>' +
    '' +
    '<path d="M653.653333 682.666667 747.093333 1024 1237.333333 1024 793.6 682.666667Z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-hand" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M870.4 204.8c-18.6368 0-36.1472 5.0176-51.2 13.7728l0-64.9728c0-56.4736-45.9264-102.4-102.4-102.4-21.0944 0-40.6528 6.4-56.9856 17.3568-14.0288-39.8848-52.0192-68.5568-96.6144-68.5568s-82.6368 28.672-96.6144 68.5568c-16.2816-10.9568-35.8912-17.3568-56.9856-17.3568-56.4736 0-102.4 45.9264-102.4 102.4l0 377.4976-68.9152-119.4496c-13.3632-24.32-35.1744-41.6256-61.3888-48.7936-25.5488-6.9632-52.1216-3.2768-74.8544 10.3424-46.4384 27.8528-64.1536 90.8288-39.424 140.3904 1.536 3.1232 34.2016 70.0416 136.192 273.92 48.0256 96 100.7104 164.6592 156.6208 203.9808 43.8784 30.8736 74.1888 32.4608 79.8208 32.4608l256 0c43.5712 0 84.0704-14.1824 120.4224-42.0864 34.1504-26.2656 63.7952-64.256 88.064-112.8448 47.8208-95.6416 73.1136-227.9424 73.1136-382.6688l0-179.2c0-56.4736-45.9264-102.4-102.4-102.4zM921.6 486.4c0 146.7904-23.3984 271.1552-67.6864 359.7312-28.8768 57.7536-80.5888 126.6688-162.7136 126.6688l-255.488 0c-1.9968-0.1536-23.552-2.56-56.064-26.88-32.4096-24.2688-82.176-75.3664-135.0656-181.248-103.7824-207.5648-135.68-272.9472-135.9872-273.5616-0.0512-0.1024-0.0512-0.1536-0.1024-0.2048-12.8512-25.7536-3.7376-59.4944 19.9168-73.6768 10.6496-6.4 23.0912-8.0896 35.072-4.864 12.7488 3.4816 23.4496 12.0832 30.0544 24.1664 0.1024 0.1536 0.2048 0.3584 0.3072 0.512l79.9232 138.496c16.3328 29.8496 34.7136 42.3936 54.6304 37.3248 19.968-5.0688 30.0544-25.0368 30.0544-59.2384l0-400.0256c0-28.2112 22.9888-51.2 51.2-51.2s51.2 22.9888 51.2 51.2l0 332.8c0 14.1312 11.4688 25.6 25.6 25.6s25.6-11.4688 25.6-25.6l0-384c0-28.2112 22.9888-51.2 51.2-51.2s51.2 22.9888 51.2 51.2l0 384c0 14.1312 11.4688 25.6 25.6 25.6s25.6-11.4688 25.6-25.6l0-332.8c0-28.2112 22.9888-51.2 51.2-51.2s51.2 22.9888 51.2 51.2l0 384c0 14.1312 11.4688 25.6 25.6 25.6s25.6-11.4688 25.6-25.6l0-230.4c0-28.2112 22.9888-51.2 51.2-51.2s51.2 22.9888 51.2 51.2l0 179.2z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-yuan" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M512 85.333333C276.266667 85.333333 85.333333 276.266667 85.333333 512s190.933333 426.666667 426.666667 426.666667 426.666667-190.933333 426.666667-426.666667S747.733333 85.333333 512 85.333333zM512 853.333333c-188.586667 0-341.333333-152.746667-341.333333-341.333333S323.413333 170.666667 512 170.666667s341.333333 152.746667 341.333333 341.333333S700.586667 853.333333 512 853.333333z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-zhexiantu" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M1023.704765 95.970676c0-52.983672-42.987004-95.970676-95.970676-95.970676s-95.969653 42.987004-95.969653 95.970676c0 31.928145 15.744573 60.012755 39.73801 77.41406L731.108046 640.240093c-12.747313 0.623193-24.743519 3.686969-35.677535 8.747213L376.592154 324.494164c4.686738-11.246124 7.310492-23.586161 7.310492-36.582137 0-52.982649-42.985981-95.970676-95.969653-95.970676-52.983672 0-95.970676 42.988027-95.970676 95.970676 0 31.021496 14.932069 58.293603 37.738472 75.821797L90.930375 832.24182c-50.609604 2.686176-90.909409 44.238506-90.909409 95.47028 0 52.983672 42.985981 95.971699 95.970676 95.971699 52.983672 0 95.969653-42.988027 95.969653-95.971699 0-31.926098-15.744573-59.917588-39.674565-77.412013l138.270019-466.667069c15.61973-0.468674 30.052426-4.750183 42.924582-11.715821l316.339446 321.99423c-6.248301 12.683868-9.996668 26.741011-9.996668 41.863415 0 52.980602 42.985981 95.968629 95.969653 95.968629 52.982649 0 95.969653-42.988027 95.969653-95.968629 0-31.805348-15.620754-59.671995-39.424879-77.16335l140.456822-467.168489C983.40496 188.755803 1023.704765 147.205519 1023.704765 95.970676"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-attentionforbid" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M605.376 490.528l61.696 59.04C670.016 537.44 672 524.992 672 512c0-88.224-71.776-160-160-160-15.424 0-30.016 2.88-44.16 6.976l61.44 58.784C566.944 424.64 596.832 453.472 605.376 490.528zM556.256 664.992l-61.376-58.752c-37.792-6.848-67.84-35.744-76.32-72.96l-61.632-58.944C353.984 486.496 352 498.976 352 512c0 88.224 71.776 160 160 160C527.456 672 542.08 669.088 556.256 664.992zM178.944 136.864C166.144 124.672 145.888 125.12 133.696 137.888 121.472 150.656 121.92 170.912 134.688 183.136l736 704C876.896 893.056 884.832 896 892.8 896c8.448 0 16.832-3.328 23.136-9.888 12.224-12.768 11.744-33.024-0.992-45.248L178.944 136.864zM512 800c-169.28 0-335.328-113.568-414.88-283.936-0.16-0.608-0.352-1.152-0.544-1.728-0.064-0.544-0.224-0.992-0.288-1.312C96.256 512.672 96 512.224 96 511.776L96 511.36c0-0.736 0.448-1.472 0.544-2.208 0.128-0.448 0.352-0.832 0.48-1.28 29.728-64.128 72-120.256 122.144-165.312L172.864 298.304c-55.488 50.656-102.08 113.152-134.624 184.256-1.056 2.112-1.792 4.096-2.272 5.888-0.256 0.544-0.448 1.056-0.64 1.6-1.76 5.056-1.76 8.48-1.632 7.712-0.8 3.744-1.6 11.2-1.6 11.2-0.224 2.24-0.192 4.032 0.064 6.272 0 0 0.704 13.472 1.056 14.816l4.544 13.632C126.4 737.344 316.992 865.76 512 865.76c69.824 0 138.976-17.792 203.104-47.936l-49.856-48.576C616.128 789.12 564.224 800 512 800zM992 512.096c0-5.792-0.992-10.592-1.28-11.136-0.192-2.912-1.152-8.096-2.08-10.816-0.256-0.672-0.544-1.376-0.832-2.08-0.48-1.568-1.024-3.104-1.6-4.32C897.664 290.08 707.104 160 512 160c-69.76 0-138.88 16.864-203.008 47.072l49.856 47.648C407.968 234.88 459.808 224 512 224c169.76 0 336.192 114.048 414.752 283.68 0.096 0.32 0.16 0.608 0.256 0.8 0.064 0.288 0.16 0.608 0.256 0.864 0.16 1.28 0.32 2.496 0.48 3.168-0.16 0.672-0.256 1.28-0.384 1.952-0.032 0.16-0.096 0.32-0.128 0.48-0.128 0.416-0.288 0.864-0.416 1.376-29.696 64-71.872 120.032-121.952 165.056l46.336 44.32c55.328-50.496 101.728-112.672 134.016-183.36 1.376-2.496 2.24-4.832 2.848-6.912 0.256-0.608 0.48-1.184 0.672-1.76 1.536-4.48 1.856-8.352 1.728-8.352 0 0 0 0.032-0.032 0.032C991.04 522.272 992 517.664 992 512.096z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-huizhiduobianxing" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M915.41954 712.88535l0-299.37069c29.34944-9.8616 50.55746-37.61059 50.55746-70.23973 0-40.8555-33.23801-74.09453-74.09351-74.09453-32.62914 0-60.37813 21.20904-70.23973 50.55848l-619.28854-204.8c-9.8616-29.349435-37.6106-50.558475-70.23974-50.558475-40.855501 0-74.09351 33.238-74.09351 74.094525 0 32.62914 21.209044 60.37813 50.55747 70.23973l102.4 606.57069c-29.34842 9.8616-50.55747 37.61162-50.55747 70.23973 0 40.85653 33.23801 74.09451 74.09351 74.09451 32.62812 0 60.37814-21.20902 70.23872-50.55744l516.89058-102.4c9.8616 29.34946 37.61162 50.55747 70.23974 50.55747 40.8555 0 74.09351-33.23801 74.09351-74.09453-0.001-32.62811-21.20905-60.37915-50.55849-70.23974zm-93.77476 46.7037l-516.88956 102.4c-7.37395-21.94889-24.75378-39.32975-46.7037-46.70471l-102.4-606.56967c21.9489-7.37496 39.32873-24.7548 46.7037-46.70369l619.28956 204.8c7.37497 21.94889 24.7548 39.32873 46.7037 46.70369l0 299.37069c-21.94992 7.37497-39.32976 24.7548-46.7037 46.70369z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-global" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M553.213657 111.319341c-0.01228-0.00614-0.024559-0.00614-0.049119-0.00614-6.723122-0.685615-13.496385-1.201361-20.317745-1.548262-0.098237-0.00307-0.208754-0.00614-0.306992-0.01228-3.294023-0.165776-6.575766-0.288572-9.882068-0.3776-0.135076-0.00307-0.270153-0.00921-0.417509-0.00921-3.39226-0.085958-6.809079-0.132006-10.239202-0.132006-124.660184 0-236.08288 56.648185-309.955354 145.583726-57.942667 69.77311-92.800569 159.405523-92.812849 257.187547C109.244077 734.444255 289.573141 914.76718 512 914.76718c222.439138 0 402.768203-180.322925 402.768203-402.765133C914.768203 303.47271 756.293889 131.956358 553.213657 111.319341zM183.951569 512.010233c0-40.983413 7.546883-80.205717 21.276582-116.376521 17.404392 9.829879 40.795125 11.615549 40.795125 31.269168 0 64.856124 2.445702 134.38671 64.60439 135.462205 1.77032 0.027629 34.674731 11.821233 50.357921 50.342572 5.420453 13.311167 26.844392 0 50.345642 0 11.738345 0 0 18.732643 0 59.233056 0 40.359196 91.780333 102.493326 91.780333 102.493326-0.429789 26.709315 0.737804 48.305169 3.085268 65.557088C327.700507 836.881298 183.951569 691.236174 183.951569 512.010233zM591.56308 830.336232c12.955056-52.232618 19.23611-81.480756 46.24116-103.694687 39.087227-32.111349 4.65809-67.821665-25.087375-63.605643-23.427572 3.349281-8.616238-27.511587-29.53671-29.217439-20.932752-1.665942-48.243771-41.10928-78.358649-54.676273-15.966647-7.181563-31.66314-26.436092-56.270585-27.302833-21.805632-0.796132-53.702086 17.48421-53.702086 3.38919 0-45.398979-4.843308-77.80197-5.838985-90.744747-0.811482-10.392698-7.178493-3.496637 22.321378-2.827395 16.052604 0.405229 8.198729-30.563086 24.091698-31.770588 15.610536-1.164522 52.804646 13.852496 62.269205 7.866155 8.812713-5.577019 64.690348 139.050939 64.690348 23.904433 0-13.659091-7.460925-37.415145 0-50.357921 29.52443-51.132564 57.180304-92.800569 54.685483-98.900497-1.388627-3.435239-30.212092-6.268774-53.246715 1.054005-7.780197 2.467191 2.482541 14.012132-8.689916 16.477276-41.86448 9.160637-78.825276-10.69969-65.8825-29.349445 13.262048-19.131733 61.310368-8.349155 65.514109-46.704718 2.421142-21.977547 4.424776-47.427172 5.776563-66.342987 117.396757 17.398252 214.499305 96.982822 256.770038 204.180286-111.705128 81.382519-83.114976 138.14429-46.413076 170.652681 19.309788 17.08205 37.72316 42.783409 49.731658 61.23362C783.765567 725.443253 697.933713 803.844881 591.56308 830.336232z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-forbid-s-o" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M512 0C229.248 0 0 229.248 0 512c0 282.752 229.248 512 512 512s512-229.248 512-512C1024 229.248 794.752 0 512 0zM944 512c0 87.616-26.24 169.024-71.104 237.12l-664.832-544C286.144 127.808 393.472 80 512 80 750.592 80 944 273.408 944 512zM80 512c0-87.616 26.24-169.024 71.104-237.12l664.832 544C737.856 896.192 630.528 944 512 944 273.408 944 80 750.592 80 512z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '</svg>'
  var script = function() {
    var scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1]
  }()
  var shouldInjectCss = script.getAttribute("data-injectcss")

  /**
   * document ready
   */
  var ready = function(fn) {
    if (document.addEventListener) {
      if (~["complete", "loaded", "interactive"].indexOf(document.readyState)) {
        setTimeout(fn, 0)
      } else {
        var loadFn = function() {
          document.removeEventListener("DOMContentLoaded", loadFn, false)
          fn()
        }
        document.addEventListener("DOMContentLoaded", loadFn, false)
      }
    } else if (document.attachEvent) {
      IEContentLoaded(window, fn)
    }

    function IEContentLoaded(w, fn) {
      var d = w.document,
        done = false,
        // only fire once
        init = function() {
          if (!done) {
            done = true
            fn()
          }
        }
        // polling for no errors
      var polling = function() {
        try {
          // throws errors until after ondocumentready
          d.documentElement.doScroll('left')
        } catch (e) {
          setTimeout(polling, 50)
          return
        }
        // no errors, fire

        init()
      };

      polling()
        // trying to always fire before onload
      d.onreadystatechange = function() {
        if (d.readyState == 'complete') {
          d.onreadystatechange = null
          init()
        }
      }
    }
  }

  /**
   * Insert el before target
   *
   * @param {Element} el
   * @param {Element} target
   */

  var before = function(el, target) {
    target.parentNode.insertBefore(el, target)
  }

  /**
   * Prepend el to target
   *
   * @param {Element} el
   * @param {Element} target
   */

  var prepend = function(el, target) {
    if (target.firstChild) {
      before(el, target.firstChild)
    } else {
      target.appendChild(el)
    }
  }

  function appendSvg() {
    var div, svg

    div = document.createElement('div')
    div.innerHTML = svgSprite
    svgSprite = null
    svg = div.getElementsByTagName('svg')[0]
    if (svg) {
      svg.setAttribute('aria-hidden', 'true')
      svg.style.position = 'absolute'
      svg.style.width = 0
      svg.style.height = 0
      svg.style.overflow = 'hidden'
      prepend(svg, document.body)
    }
  }

  if (shouldInjectCss && !window.__iconfont__svg__cssinject__) {
    window.__iconfont__svg__cssinject__ = true
    try {
      document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>");
    } catch (e) {
      console && console.log(e)
    }
  }

  ready(appendSvg)


})(window)
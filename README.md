# angular-treeviewer

An expandable and searchable treeview Angular JS directive for displaying, searching, and interacting with arbitrary heirarchical data.

## Usage

```html
<div angular-treeviewer 
    full-tree='fullTree' 
    open-icon-class="'fa fa-minus'" 
    close-icon-class="'fa fa-plus'" 
    empty-icon-class="'fa fa-ban'" 
    group-icon-class="'fa fa-file-text'" 
    search-icon-class="'fa fa-search'"
    remove-empty-values="false"
    normalize-words="true">
```

where:

*   **fullTree** (required) is a model containing heirarchical data (i.e. arrays containing objects containing arrays etc.)
*   **open-icon-class** (optional) is a CSS class identifying an icon to be prefixed to a collection item in an 'opened' state (or suggesting a 'contract' action). 
*   **close-icon-class** (optional) is a CSS class identifying an icon to be prefixed to a collection item in a 'closed' state (or suggesting an 'expand' action). 
*   **empty-icon-class** (optional) is a CSS class identiifying an icon to be prefixed to an empty collection item. 
*   **group--icon-class** (optional) is a CSS class identifying an icon used to identify a group of object data in an expanded array of objects. 
*   **group--icon-class** (optional) is a CSS class identifying an icon used to identify a group of object data in an expanded array of objects. 
*   **search-icon-class** (optional) is a CSS class identifying an icon used to identify the input type='text' box as a search box. This item is placed immediately to the right of the search input type='text' box.
*   **remove-empty-values** (optional, defaults to false) true or false indicating whether or not null or blank items should be removed before displaying.
*   **normalize-words** (optional. defaults to false) true or false indicating whether or not underscores in keys should be replaced with blank before displaying and all words replaced with first letter cap and rest lowercase. Primarily used when keys are snake case.

The following CSS classes can be used for styling:

*   **key** styles the data keys (i.e. key: value)
*   **value** styles the data values (i.e. key: value)
*   **search-box** styles the search input type='text' box.
*   **search-count** styles the search find count text.
*   **expanded-item-with-icon** typically styles *margin-left* to specify indentation of child items with an icon.
*   **expanded-item-without-icon** typically styles *margin-left* to specify indentation of child items without an icon. The difference between *margin-left* for this class and **expanded-item-with-icon** is typically set to be the width of the icons so all items are left justified.
*   **root-item-without-icon** typically styles *margin-left* to specify indentation of root items without an icon. This value is typically set to be the width of the icons so all items are left justified.

## Author

Russell Morley. MIT licensed.

## More Info


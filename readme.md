## SQLDynamicWhere


#### Usage : 

``` javascript


    // use import or require 
    // import SQLDynamicWhere from 'dynamic-where-sql-js';
    const SQLDynamicWhere = require('dynamic-where-sql-js');

    // you can also use mysql2 to work with async/await
    const mysql = require('mysql');


    const dynamicWhere = new SQLDynamicWhere();


    // chain function 
    dynamicWhere
    .add({  
        field: 'column',
        comparasion: SQLDynamicWhere.Comparison.EQUAL,
        value: true
    })
    .and()
    .add({
        field: 'column2',
        comparasion: SQLDynamicWhere.Comparison.EQUAL,
        value: false
    })
    .add({
        field: 'column3',
        comparasion: SQLDynamicWhere.Comparison.EQUAL,
        value: true
    })


    const result = dynamicWhere.getClauses();
    //
    //  result.query => `column` = ? AND `column2` = ? OR `column3` = ?
    //  result.values => [true, false, true]
    //
    //



    // .... create msyql connection
    const db = mysql.connect();

    db.query(
        ` SELECT * FROM table WHERE ${result.query}`,
        result.values,
        (err, result) => {
            console.log(result);
        }
    )

```


<br>

#### add()
```javascript

    const dynamicWhere = new SQLDynamicWhere();
    dynamicWhere.add({
        field: 'column', 
        comparasion: SQLDynamicWhere.Comparison.EQUAL,
        value: true,

        // logic that link with previous query;
        // you can also use chain function and() or or() method before calling add()
        logic: SQLDynamicWhere.Logic.AND,
    })

    // the terms as follow:
    // [logic] [field] [comparasion] [value]
    // 
    //

    // RESULT: 
    // AND `column` = 1 
```



<br>

#### in()
```javascript

    const dynamicWhere = new SQLDynamicWhere();
    dynamicWhere.in({
        field: 'column', 
        // logic that link with previous query;
        // you can also use chain function and() or or() method before calling add()
        logic: SQLDynamicWhere.Logic.AND,
    }, [value1, value2, value2])

    // the terms as follow:
    // [logic] [field] [comparasion] [value]
    // 
    //

    // RESULT: 
    // `column` in (value1, value2, value2)
```






#### bracket()
```javascript

    const dynamicWhere = new SQLDynamicWhere();
    dynamicWhere.bracket()

    // the terms as follow:
    // [logic] [field] [comparasion] [value]
    // 
    //

    // BEFORE CALLING METHOD: 
    // `column` in (value1, value2, value2)

    // AFTER CALLING METHOD: 
    // ( `column` in (value1, value2, value2) )
```




<br>

#### addMultipleCompareFields()
```javascript

    const dynamicWhere = new SQLDynamicWhere();
    dynamicWhere.addMultipleCompareValues({
        fields: ['column', 'column2', 'column3'], 
        comparasion: SQLDynamicWhere.Comparison.EQUAL,
        value: true,
        logic: SQLDynamicWhere.Logic.AND,

        // linkLogic mean logic that link with previous query;
        // you can also use and() or or() method before calling addMultipleCompareValues()
        linkLogic: SQLDynamicWhere.Logic.OR, 
        scope: false // if true the query will be scoped with parenthesis
    })

    // the terms as follow:
    // [linkLogic] [field] [comparasion] [value] [logic]
    // 
    //

    // RESULT: 
    // `column` = true AND `column2` = true AND `column3` = true

    // RESULT IF scope true : 
    // ( `column` = true AND `column2` = true AND `column3` = true )
```






<br>

#### addMultipleCompareValues()
```javascript


    const dynamicWhere = new SQLDynamicWhere();
    dynamicWhere.addMultipleCompareValues({
        field: 'column', 
        comparasion: SQLDynamicWhere.Comparison.EQUAL,
        values: [1, 2, 3, 4],
        logic: SQLDynamicWhere.Logic.AND,

        // linkLogic mean logic that link with previous query;
        // you can also use and() or or() method before calling addMultipleCompareValues()
        linkLogic: SQLDynamicWhere.Logic.OR, 
        scope: false // if true the query will be scoped with parenthesis
    })

    // the terms as follow:
    // [linkLogic] [field] [comparasion] [value] [logic]
    // 
    //

    // RESULT: 
    // `column` = 1 AND `column` = 2 AND `column` = 3 AND `column` = 4

    // RESULT IF scope true : 
    // ( `column` = 1 AND `column` = 2 AND `column` = 3 AND `column` = 4 )
```





<br>

#### addMultipleCompareValues()
```javascript


    const dynamicWhere = new SQLDynamicWhere();
    dynamicWhere.addMultipleCompareFieldsAndValues({
        fields: ['column', 'column2', 'column3'], 
        comparasion: SQLDynamicWhere.Comparison.EQUAL,
        values: [1, 2, 3],
        logic: SQLDynamicWhere.Logic.AND,

        // linkLogic mean logic that link with previous query;
        // you can also use and() or or() method before calling addMultipleCompareValues()
        linkLogic: SQLDynamicWhere.Logic.OR, 
        scope: false // if true the query will be scoped with parenthesis
    })

    // the terms as follow:
    // [linkLogic] [field] [comparasion] [value] [logic]
    // 
    //

    // RESULT: 
    // `column` = 1 AND `column2` = 2 AND `column3` = 3 

    // RESULT IF scope true : 
    // ( `column` = 1 AND `column2` = 2 AND `column3` = 3  )
```




#### mergeQuery()
```javascript

    const query1 = new SQLDynamicWhere();

    query1
        .add( ... );
        .and()
        .add( ... );
        .or();
        .add( ... );


    const query2 = new SQLDynamicWhere();

    query2
        .addMultipleCompareValues( ... );
        .and()
        .addMultipleCompareValues( ... );
        .or();
        .addMultipleCompareValues( ... );


    // two query will be merge
    query1.mergeQuery({
        logic: <a logic between query> 'AND' | 'OR',
        dynamicwhere: query2
    });

    // RESULT : 
    // query1 AND query2


```




<br>

### Final result 
```javascript
    const dynamicWhere = new SQLDynamicWhere();
    
    ... add where
    





    const clause = dynamicWhere.getClauses({ includeWhere: false });
    const query = dynamicWhere.getQuery({ includeWhere: true });
    const values = dynamicWhere.getValues();

    // NOTE: 
    // before calling any these 3 methods 
    // make sure the query close or it will throw error

    // if `includeWhere` true
    // the query will start with WHERE
    // by default `includeWhere` is false


    console.log(clause)
    // 
    //  {
    //      query: "`column` = ? AND `column2` = ? AND `column3` = ?",
    //      values: [1, 2, 3]
    //  }
    //

    console.log(query);
    // RESULT: "WHERE `column` = ? AND `column2` = ? AND `column3` = ?"

    console.log(values)
    // RESULT: [1, 2, 3]


```






<br>

##### Query is not closed error

when using chain function\
there might be <code>Query is not closed</code> error can occur when the query is not fully completed.\
Example as follow:
```javascript

    const dynamicWhere = new SQLDynamicWhere();

    // chain function 
    dynamicWhere
    .add({  
        field: 'column',
        comparasion: SQLDynamicWhere.Comparison.EQUAL,
        value: true
    })
    .and() // ==> query is not completed ending with AND

```



<br>

##### Alternative way to force neglect Query not close error
We are not recommanded to ignore query close check. Due to flexiability, we still allow user to close query close check.

```javascript

    const dynamicWhere = new SQLDynamicWhere();
    
    ... add where

    // call this function will ignore query close check
    dynamicWhere.forceMarkAsEndQuery();

    // then call getClauses()
    const clause = dynamicWhere.getClauses();

    

```





<br>

#### addRaw()

we are not recommanded to add raw query, due to flexability, we add this function to allow user to add raw query.

```javascript


    const dynamicWhere = new SQLDynamicWhere();
    dynamicWhere.addRaw({
        query: 'column1 = ?, column2 = ?',
        values: [true, false],
        logic: 
    })


    // the terms as follow:
    // [logic] [query]


```
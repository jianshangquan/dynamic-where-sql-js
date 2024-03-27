

module.exports = class SQLDynamicWhere {
    #query = '';
    #isFirst = true;
    #isEndClause = false;
    #checkClose = true
    #values = [];


    static Comparison = Object.freeze({
        EQUAL: '=',
        NOT_EQUAL: '!=',
        LIKE: 'LIKE',
        GRATER_THEN: '<',
        GRATER_THEN_AND_EQUAL: '<=',
        LESS_THEN: '>',
        LESS_THEN_AND_EQUAL: '>=',
        IN: 'in'
    })

    static Logic = Object.freeze({
        AND: 'AND',
        OR: 'OR',
    })


    static initialize({ checkClose = false } = {}) {
        return new SQLDynamicWhere({ checkClose });
    }

    constructor({ checkClose = true } = {}) {
        this.#checkClose = checkClose;
    }


    mergeQuery({ logic = '', dynamicwhere }) {
        if (dynamicwhere instanceof SQLDynamicWhere) {
            const query = dynamicwhere.getClauses();
            this.#query = this.#query + `${this.#isFirst ? '' : ` ${logic} `}` + query.query;
            this.#values = this.#values.concat(query.values);
            this.#isEndClause = true;
            this.#isFirst = false;
            return this;
        }
        throw new Error('Is not SQLDynamicWhere Object');
    }




    add({ field, comparasion, value, logic = '', additionFieldQuery = '' } = {}) {
        if(comparasion == SQLDynamicWhere.Comparison.IN){
            this.in({ field, logic }, value);
        }else{
            this.#query = this.#query + `${this.#isFirst ? '' : ` ${logic} `}${this.#buildField(field)} ${additionFieldQuery} ${comparasion} ?`;
            this.#values.push(value);
            this.#isFirst = false;
            this.#isEndClause = true;
        }
        return this;
    }


    addRaw({query = '', values = [], logic}){
        this.#query = this.#query + `${this.#isFirst ? '' : ` ${logic} `}${query}`;
        this.#values = this.#values.concat(values);
        this.#isFirst = false;
        this.#isEndClause = true;
    }


    addMultipleCompareValues({ field, comparasion, values = [], logic = '', scope = false, linkLogic = '' } = {}) {
        if (values.length == 0) {
            return this;
        }

        const query = SQLDynamicWhere.initialize();
        values.forEach(val => {
            query.add({ field, comparasion, value: val, logic });
        });
        query.bracket(scope);
        this.mergeQuery({ dynamicwhere: query, logic: linkLogic || '' });
        this.#isFirst = false;
        this.#isEndClause = true;
        return this;
    }




    addMultipleCompareFields({ fields = [], comparasion, value, logic = '', scope = false, linkLogic = '' } = {}){
        if(fields.length == 0 || !value) return this;

        const query = SQLDynamicWhere.initialize();
        fields.forEach(field => {
            query.add({ field, comparasion, value, logic });
        })
        query.bracket(scope);
        this.mergeQuery({ dynamicwhere: query, logic: linkLogic || '' });
        this.#isFirst = false;
        this.#isEndClause = true;
        return this;
    }



    addMultipleCompareFieldsAndValues({ fields = [], comparasion, values = [], logic = '', scope = false, linkLogic = '' } = {}){
        if(fields.length == 0 || values.length == 0 && fields.length != values.length) return this;

        const query = SQLDynamicWhere.initialize();
        fields.forEach((field, index) => {
            query.add({ field, comparasion, value: values[index], logic });
        })
        query.bracket(scope);
        this.mergeQuery({ dynamicwhere: query, logic: linkLogic || '' });
        this.#isFirst = false;
        this.#isEndClause = true;
        return this;
    }



    addByRawArrayQueries({ queries = [], scope = false, linkLogic = '' } = {}){
        if(queries.length == 0) return this;

        const query = SQLDynamicWhere.initialize();
        queries.forEach(query => {
            const { field, comparasion, value, logic = '' } = query;
            query.add({ field, comparasion, value, logic })
        });
        query.bracket(scope);
        this.mergeQuery({ dynamicwhere: query, logic: linkLogic || '' });
        this.#isFirst = false;
        this.#isEndClause = true;
        return this;
    }




    any({ field, values = [], logic = '', scope = false, linkLogic = '' } = {}) {
        return this.addMultipleCompareValues({ field, comparasion: SQLDynamicWhere.Comparison.EQUAL, values, logic, linkLogic, scope })
    }



    between({ field, value1, value2, logic = '' }) {
        this.#query = this.#query + `${this.#isFirst ? '' : ` ${logic} `}${this.#buildField(field)} BETWEEN ? AND ?`;
        this.#values.push(value1);
        this.#values.push(value2);
        this.#isFirst = false;
        this.#isEndClause = true;
        return this;
    }


    in({ field, logic }, ...values) {
        this.#query = this.#query + `${this.#isFirst ? '' : ` ${logic} `}${this.#buildField(field)} IN (${values.map(v => '?').join(', ')})`;
        this.#values = this.#values.concat(values);
        this.#isFirst = false;
        this.#isEndClause = true;
        return this;
    }



    and() {
        if(this.#isFirst) return;
        this.#query = this.#query + " AND ";
        this.#isEndClause = false;
        return this;
    }



    or() {
        if(this.#isFirst) return;
        this.#query = this.#query + " OR ";
        this.#isEndClause = false;
        return this;
    }



    bracket(condition = true) {
        if (this.#isFirst && !condition) return;
        this.#query = `( ${this.#query} )`;
        this.#isEndClause = true;
        return this;
    }



    getClauses({ includeWhere = false } = {}) {
        const ob = {
            query: this.getQuery({ includeWhere }),
            values: this.getValues()
        };

        if (!this.#checkClose) {
            return ob;
        }

        if (this.#isEndClause)
            return ob;
        throw new Error('Query is not closed')
    }


    forceMarkAsEndQuery(){
        this.#isEndClause = true;
    }

    getValues() {
        return this.#values;
    }



    getQuery({ includeWhere = false } = {}) {
        return this.#query.length == 0 ? '' : `${includeWhere ? 'WHERE ' : ''}${this.#query}`;
    }


    #buildField(field = '') {
        return field.split('.').map(f => `\`${f}\``).join('.')
    }
}
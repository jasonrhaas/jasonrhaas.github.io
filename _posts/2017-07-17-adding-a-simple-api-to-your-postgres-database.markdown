---
title: Adding a simple API to your Postgres database
layout: post
---

When designing systems or platforms, it is very common to use a relational database such as MySQL or Postgres as a backend data storage.  In order to access this data from a remote endpoint, it's very handy to have an API that can serve out proper JSON data.

In this  post I'm going to discuss one way to approach this problem.  I'm a huge fan of simple, elegant approaches, and I think this fits the bill nicely.

I will be using some code that I wrote for the [CodeForDC](https://codefordc.org) housing insights project.

## The state of things

I volunteer some of my time to the [Housing-Insights](https://github.com/codefordc/housing-insights) project to help out with the backend and API design and implementation.  The current backend design at a high level consists of:

- Download open data
- Parse and clean data
- Add tables to Postgres database
- Access data via custom Flask API endpoints

Flask is a great Python framework for making dead simple APIs.  It is my go to if I need a lightweight application to serve up some data.  The syntax is as simple as this:

{% highlight python %}
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"
{% endhighlight %}

That is all the code you need to get a simple endpoint up and running.  If you want to create some API endpoints on your database, a simple approach is to use the Postgres `psycopg2` module for Python and run SQL queries as needed, then return the results.

And indeed, this works out pretty well.  To get raw data from tables, you can do something like this:

{% highlight python %}
@application.route('/api/raw/<table>', methods=['GET'])
@cross_origin()
def list_all(table):
    """ Generate endpoint to list all data in the tables. """

    application.logger.debug('Table selected: {}'.format(table))
    if table not in tables:
        application.logger.error('Error:  Table does not exist.')
        abort(404)

    conn = engine.connect()
    q = 'SELECT row_to_json({}) from {} limit 1000;'.format(table, table)
    proxy = conn.execute(q)
    results = [x[0] for x in proxy.fetchmany(1000)] # Only fetching 1000 for now, need to implement scrolling
    conn.close()

    return jsonify(items=results)
{% endhighlight %}

Using the simple SQL statement 

```
'SELECT row_to_json({}) from {} limit 1000;'.format(table, table)`
```

it will return 1000 rows from whatever table you select in the `table` variable.  This value comes from the Flask route `'/api/raw/<table>', methods=['GET']`.

But, as Raymond Hettinger likes to say...

> there must be a better way

And there is.

## [Flask Restless](https://flask-restless.readthedocs.io)

Flask-Restless is a plugin for Flask that takes advantage of SQL Alchemy's Object Relational Mappers to generate quick and easy endpoints.  If you have defined your database schema using SQLA (recommended), there is quite a bit of functionality out of the box.  Some examples:

- Endpoints can be generated from any model
- Auto pagination
- JSON based search
- Pre-processors and post-processors

So thats a great way to start off accessing the database, and the pagination feature makes sure you don't end up pulling too much data at once.

But, here is the problem:  the database schema was not defined in SQLA.  Sigh.  But, there is a solution to that as well.

## [SQL Alchemy Automap](http://docs.sqlalchemy.org/en/latest/orm/extensions/automap.html)

SQLA includes a feature called `automap` that is able to "reflect" information about your database tables and automatically generate the models.  Using this approach, you can now take advantage of the features that SQLA and Flask Restless have to offer.

The code is pretty simple:

{% highlight python %}
application = Flask(__name__)
application.config['SQLALCHEMY_DATABASE_URI'] = connect_str
application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(application)
Base = automap_base()

metadata = MetaData(bind=db)

Base.prepare(db.engine, reflect=True)

db.session.commit()

BuildingPermits = Base.classes.building_permits
Census = Base.classes.census
CensusMarginOfError = Base.classes.census_margin_of_error
Crime = Base.classes.crime
DcTax = Base.classes.dc_tax
Project = Base.classes.project
ReacScore = Base.classes.reac_score
RealProperty = Base.classes.real_property
Subsidy = Base.classes.subsidy
Topa = Base.classes.topa
WmataDist = Base.classes.wmata_dist
WmataInfo = Base.classes.wmata_info

models = [BuildingPermits, Census, CensusMarginOfError, Crime, DcTax, Project, ReacScore,
          RealProperty, Subsidy, Topa, WmataDist, WmataInfo
          ]

db.init_app(application)

manager = APIManager(application, flask_sqlalchemy_db=db)

for model in models:
    # https://github.com/jfinkels/flask-restless/pull/436
    model.__tablename__ = model.__table__.name
    manager.create_api(model, methods=['GET'])


@application.route('/')
def hello():
    return("The Housing Insights API Rules!")


if __name__ == '__main__':
    application.run(host='0.0.0.0', port=5000)
{% endhighlight %}

That chunk of code above is all the code you need to reflect your current tables into the SQLA model and serve up the API using Flask Restless.  Pretty badass if you ask me.  I'll walk through it a little bit to describe what is going on.

`db = SQLAlchemy(application)` 

is Flask Restless wrapper around the basic SQLA engine creator.  You pass it your Flask application object.

`Base.prepare(db.engine, reflect=True)`

here is where you tell SQLA automap which database to use, and that you want it to reflect your current database tables.

`BuildingPermits = Base.classes.building_permits`

here is where you pull the auto generated model out of `Base.classes` and assign it a model name.

`manager = APIManager(application, flask_sqlalchemy_db=db)`

create a APIManager Flask Restless API.


```
for model in models:
    # https://github.com/jfinkels/flask-restless/pull/436
    model.__tablename__ = model.__table__.name
    manager.create_api(model, methods=['GET'])
```

For this chunk of code, we are creating a basic GET endpoint for all of the models defined above.  The line above it `model.__tablename__` is a workaround for an issue that will be fixed in version 1.0 of the code.


## Conclusion

If you need a quick and dirty API on top of your SQL database, look no further than Flask and Flask Restless.  It's a great way to get started.  However, you still may have to define some custom endpoints, since Flask Restless doesn't do everything.  However using the ORM approach to create your endpoints probably leads to more maintainable and more clearly written code.

**My question to the devs out there is this**:  How does this approach compare to the Django ORM?  I know Django has a lot of capability right out of the box, and has its own built in ORM, and Rest API plugin.  I'm curious to compare it to the Flask/SQLA approach in terms of ease of use, flexibility, and overall capability.
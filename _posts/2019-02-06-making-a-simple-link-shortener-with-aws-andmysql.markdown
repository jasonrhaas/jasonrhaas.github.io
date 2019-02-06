---
title: Making a simple link shortener with AWS and MySQL
layout: post
excerpt: "Link shorteners are handy and pretty simple to implement.
There are some free services that you can use for this like bitly and google,
but in some cases it might be preferable to have the link shortener be under your own domain."
draft: false
---

![](https://cdn-images-1.medium.com/max/1600/1*NaL3SxOBXbrwXrAciJyM3Q.jpeg)

### Making a simple link shortener with AWS and MySQL

Link shorteners are handy and pretty simple to implement. There are some free
services that you can use for this like bitly and google, but in some cases it
might be preferable to have the link shortener be under your own domain. Or
maybe you want to implement some additional analytics or features that the other
services don’t have. Let’s get started!

### Usage

The goal of this project is to create a service that turns any link into a short
link under you domain. For example:

POST `api.jasonrhaas.com`

    {
      "url":  "reddit.com"
    }

The response should be:

    {
      "tiny_url": "http://jasonrhaas.com/6vyv6"
    }

When you go to that URL it should point you to reddit.com.

### Architecture

When building something, I’m a big believer in using the right tool for the job.
In other words, I’m not going to use a batteries included web framework like
Django when all I need is a simple micro service. The tools I’m using for this
job are:

* Flask
* MySQL
* Zappa (AWS Lamda + API Gateway)

Zappa is a nice tool that makes it easy to deploy an event driven API. I find
the API Gateway user interface a bit cumbersome so its nice to have a framework
that allows me to do (almost) everything from my code editor and command line.

### Implementation

To build this, I used a simple Flask application containing a single `Url`
SQLALchemy model and basically two functions, a `get_tiny_url` function and a
`get_long_url` function. 

#### Model

The model looks like this:

{% gist jasonrhaas/320d9a4bd7a8233f3d1600f9e9c77920 %}

If you aren’t familiar with model classes, I recommend checking out the [Flask
SQLAlchemy Quickstart](http://flask-sqlalchemy.pocoo.org/2.3/quickstart/) for a
crash course. If you want to go a bit deeper into what database model classes
can provide, check out the [Django
Tutorial](https://docs.djangoproject.com/en/2.1/topics/db/models/) on models.
The [SQLAlchemy documentation](https://docs.sqlalchemy.org/en/latest/) is
comprehensive, but its very dense and technical and in my opinion is not a good
introduction to models.

In the `Url` model above, here are what the different tables are:

* `id` — just a database id. In some cases (like for Django), this line isn’t even
necessary and is provided automatically.
* `hash` — This is the what the long url gets turned into after it is shortened.
* `long` — This is the original url.
* `hits` — A simple numeric field that keeps track of how many times the link as
been accessed.

We could expand this to provide even more information and analytics, like user
IP address, referring URL, timestamp of when it was accessed, etc. But for this
case I just needed something simple. The good part is this is easy to expand
upon later.

#### Get Tiny URL

The function to create the short link I decided to call `get_tiny_url`. The
function looks like this:

{% gist jasonrhaas/be559a46d24db938758dfa687945a09e %}

To explain this, I’m going to pick out a few lines.

#### Line 3

First we check to make sure that it is a POST request and a valid JSON object.
If it’s not, we simply redirect to the base url. This is kind of a “catch all”
approach and works fine for our use case, but it could be improved to have more
specific error catching and an appropriate error message for the user.

#### Line 9

It’s never* a good idea to store potentially sensitive information in a database
in clear text. As secure as your system is, there is always a chance that it may
be hacked and the data may be stolen. As a good rule of thumb, passwords should
*always* be hashed, for example.

In this case, I don’t have passwords, I’m just using the hash to identify a
unique URL. The area of password hashing is a complex and convoluted one. During
my research of implementing a JWT API Gateway Authorization solution, I found
that the Python [Blake2](https://docs.python.org/3/library/hashlib.html#blake2)
library appears to be the new industry standard that is considered good enough
to hash passwords. In Python 3.6, this was added to the Python standard library.

When this line gets run, you end up with a hash like
**53761004cf82ca63a62c430e8a409a6703d63f45**. This hash is deterministic, but
its “one-way” meaning that it’s (almost) impossible derive the `long_url` from
this hash code on its own.

#### Line 12

This line is to try to find the url by the hash. This hash is unique per url, so
there should never be any duplicates in the database. If the `url` does not
exist, it will add it to the database.

#### Line 20

Finally, we make use of the
[short_url](https://github.com/Alir3z4/python-short_url) Python library. This
library uses a bit-shuffling approach to deterministically generate URLs from a
number. In essence, this number corresponds to the database `id`. For our use
case, the number will point to an `id` in the database, which contains the
`long_url`.

#### Get Long URL

On to the reverse function, `get_long_url` which looks up the original URL given
the short link.

{% gist jasonrhaas/41ac789259c251133b98dab16558543a %}

Picking out a few lines of interest:

#### Line 5

This line takes the `/tiny_url` part of the link and translate it to the
`url_id` which matches up with the database `id`.

#### Line 13

This a simple counter keeping track of how many times the line gets access. This
information is then updated in the database.

### Conclusion

As you can see, coding up a link shortener is pretty straightforward! To test
this locally, all you need is a local MySQL database and Python3. In the next
blog post, I’ll talk in depth about how to set up your local environment and
also do automatically deployments using Continuous Integration and AWS.
